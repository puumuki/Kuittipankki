import json
import datetime
import sqlalchemy
from sqlalchemy.engine import create_engine


def connect(user, password, db, host='localhost', port=5432):

    url = 'postgresql://kuittipankki:kuittipankki@localhost:5432/kuittipankki'
    url = url.format(user, password, host, port, db)

    con = sqlalchemy.create_engine(url, client_encoding='utf8')

    meta = sqlalchemy.MetaData(bind=con, reflect=True)

    return con, meta

def load_data_json( filename ):
    with open(filename, 'r') as filehandle:
        return json.load( filehandle )

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

def main():
    con, meta = connect('kuittipankki', 'kuittipankki', 'kuittipankki')

    receipt_table = meta.tables['receipt']
    tag_table = meta.tables['tag']
    file_table = meta.tables['file']

    receipts = load_data_json('../data/receipts.json')
    fileMeta = load_data_json('../data/file-meta.json')

    user_id = 3
    created_by = 3
    updated_by = 3

    for receipt in receipts:

        data = DataConversion( receipt )

        if len(data.get("name")) == 0:
            continue

        print("Processing receipt %s" % (data.get('name'),))

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

            print("Processing receipt's files...")

            for _file in data.get('files'):

                file_data =  DataConversion( _file )

                print("Processing file ", _file.get('filename'))

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

                print("Trying to find file's meta data")

                metadata = fileMeta.get(_file.get('filename'))

                if metadata:
                    print("Found file's meta data, saving it.")
                    _metadata = DataConversion(metadata)

                    print( _metadata.get_integer('width') );

                    file_dictionary['width'] = _metadata.get_integer('width')
                    file_dictionary['height'] = _metadata.get_integer('height')
                    file_dictionary['depth'] = _metadata.get_integer('depth')
                    file_dictionary['original_file_name'] = _metadata.get('originalFilename')

                    if _metadata.has('density'):
                        file_dictionary['density_x'] = _metadata.get('density').get('x')
                        file_dictionary['density_y'] = _metadata.get('density').get('y')

                else:
                    print("File's meta data is not found")

                clause = file_table.insert().values( file_dictionary )

                con.execute( clause )

        print("Saved receipt %s" % (data.get('name'),))


if __name__ == '__main__':
    main()