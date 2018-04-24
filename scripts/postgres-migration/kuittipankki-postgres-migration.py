import json
import datetime
import sqlalchemy
import builtins as __builtin__
import logging
from sqlalchemy.engine import create_engine
from sqlalchemy.orm.session import sessionmaker
from sqlalchemy.sql import select
from sqlalchemy.sql import and_, or_, not_
from sqlalchemy import text

class MigrationError(Exception):
    pass

def connect(user, password, db, host='localhost', port=5432):
    url = 'postgres://{user}:{password}@{host}/{db}'
    url = url.format(user=user, password=password, host=host, db=db)
    con = sqlalchemy.create_engine(url, client_encoding='utf8')
    meta = sqlalchemy.MetaData(bind=con, reflect=True)
    Session = sessionmaker(bind=con)
    return con, meta, Session

def load_data_json( filename ):
    try :
        with open(filename, 'r') as filehandle:
            return json.load( filehandle )
    except ValueError as error:
        raise MigrationError("Error while reading {0}, error: {1}".format( filename, str(error) ) )
    except FileNotFoundError as error2:
        raise MigrationError("JSON file not found {0}, please check configuration".format(error2.filename))

class DataConversion:

    def __init__(self, dictionary):
        self._dictionary = dictionary

    def get(self, key):
        return self._dictionary[key] if key in self._dictionary else ''

    def has(self, key):
        return key in self._dictionary

    def get_float(self, key):
        value = self.get(key)
        return float(value.replace(',','.'))

    def get_integer(self, key):
        value = self.get(key)
        if type(value) is int:
            return value
        elif type(value) is str and len(value) > 0:
            return int(value)
        else:
            return None

    def get_timestamp(self, key):
        value =  self.get(key)
        return None if value == '' else value

def migrate( configurations, meta, con ):

    level = configurations.get('logging').get('level')

    logging.basicConfig(format='%(message)s',level=level.upper())

    receipts = load_data_json( configurations.get('data').get('receipts') )
    fileMeta = load_data_json( configurations.get('data').get('filemeta') )
    users = load_data_json( configurations.get('data').get('users') )    

    user_table = meta.tables['user']
    receipt_table = meta.tables['receipt']
    tag_table = meta.tables['tag']
    file_table = meta.tables['file']

    sql = text("SELECT * FROM \"user\" WHERE username in('admin', 'integration')");
    result = con.execute( sql )

    if result.rowcount == 0:
        raise MigrationError("Admin or integartion user are not created to user table, please add them before running the script. "\
                              "Queries can be found from kuittipankki-schema.sql file.")

    user_id = 1
    created_by = 1
    updated_by = 1

    userid_to_jsonid = {}

    for idnum, user in enumerate( users ):
        data = DataConversion( users[user] )        

        user_dictionary = {
            "username": data.get('username'),
            "password": data.get('password'),
            "salt": data.get('salt'),
            "lang": data.get('lang'),
            "created_by" : created_by,
            "updated_by" : updated_by            
        }

        clause = user_table.insert().returning(user_table.c.user_id).values(
            user_dictionary
        )

        result = con.execute(clause)
        user_id = result.first()[0]

        userid_to_jsonid[user] = user_id

    for receipt in receipts:

        data = DataConversion( receipt )

        if len(data.get("name")) == 0:
            continue

        logging.info("Processing receipt %s" % (data.get('name'),))

        user_id = userid_to_jsonid.get( data.get('user_id') )

        receipt_dictionary = {
            "name" : data.get('name'),
            "store" : data.get('store'),
            "registered" : data.get_timestamp('registered'),
            "description" : data.get_timestamp('description'),
            "warrantly_end_date" : data.get_timestamp('warrantlyEndDate'),
            "purchase_date" : data.get_timestamp('purchaseDate'),
            "price" : data.get('price'),
            "user_id" : user_id,
            "created_by" : created_by,
            "updated_by" : updated_by
        }

        if data.has('created'):
            receipt_dictionary['created_on'] = data.get_timestamp('created')
            receipt_dictionary['updated_on'] = data.get_timestamp('created')

        clause = receipt_table.insert().returning(receipt_table.c.receipt_id).values(
            receipt_dictionary
        )

        result = con.execute(clause)

        receipt_id = result.first()[0]

        if data.has('tags'):
            for tag in receipt.get('tags'):

                tag_dictionary = {
                    "receipt_id": receipt_id,
                    "name" : tag,
                    "created_by": created_by,
                    "updated_by": updated_by
                }

                if data.has('created'):
                    tag_dictionary['created_on'] = data.get_timestamp('created')
                    tag_dictionary['updated_on'] = data.get_timestamp('created')

                clause = tag_table.insert().returning(tag_table.c.tag_id).values( tag_dictionary )

                con.execute( clause )

        if data.has('files'):

            logging.info("Processing receipt's files...")

            for _file in data.get('files'):

                file_data =  DataConversion( _file )

                logging.info("Processing file {0}".format(_file.get('filename')))

                file_dictionary = {
                    "receipt_id": receipt_id,
                    "user_id": user_id,
                    "filename": file_data.get('filename'),
                    "thumbnail": file_data.get('thumbnail'),
                    "mimetype": file_data.get('mimetype'),
                    "size": file_data.get_integer('size'),
                    "created_by": created_by,
                    "updated_by": updated_by
                }

                if data.has('created'):
                    file_dictionary['created_on'] = data.get_timestamp('created')
                    file_dictionary['updated_on'] = data.get_timestamp('created')

                logging.info("Trying to find file's meta data")

                metadata = fileMeta.get(_file.get('filename'))

                if metadata:
                    logging.info("Found file's meta data, saving it.")
                    _metadata = DataConversion(metadata)

                    logging.info( _metadata.get_integer('width') );

                    file_dictionary['width'] = _metadata.get_integer('width')
                    file_dictionary['height'] = _metadata.get_integer('height')
                    file_dictionary['depth'] = _metadata.get_integer('depth')
                    file_dictionary['original_file_name'] = _metadata.get('originalFilename')

                    if _metadata.has('density'):
                        file_dictionary['density_x'] = _metadata.get('density').get('x')
                        file_dictionary['density_y'] = _metadata.get('density').get('y')

                else:
                    logging.info("File's meta data is not found")

                clause = file_table.insert().values( file_dictionary )

                con.execute( clause )

        logging.info("Saved receipt %s" % (data.get('name'),))



def main():
    configurations = load_data_json( 'migration-config.json' )

    con, meta, Session = connect(
        user=configurations.get('db').get('user'),
        password=configurations.get('db').get('password'),
        host=configurations.get('db').get('host'),
        db=configurations.get('db').get('database'),
        port=configurations.get('db').get('port')
    )

    session = Session()
    
    try:
        migrate(configurations, meta, session)
        session.commit()
        session.close()
        logging.info("Committing changes")
    except MigrationError as error:
        logging.error( error )
        session.rollback()
        logging.info("Rollbacking changes")
    except Exception as error2:
        logging.error( error2 )
        session.rollback()
        logging.info("Rollbacking changes")


if __name__ == '__main__':
    main()