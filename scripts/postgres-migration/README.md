## Kuittipankki Postgres Migration

This is a script for migrating data from old Kuittipankki for new Posgtres based Kuittipankki. These script are used to read data from file-meta.json, user.json and receipts.json files to postgres database. Running script is partially manual and partially automatic.

## Directory Structure

```
.
├── README.md
├── data
│   ├── file-meta.json - file to be imported
│   ├── receipts.json - file to be imported
│   └── users.json - file to be imported
├── migration-config.yaml - importing script
├── kuittipankki-postgres-migration.py - importing script
└── kuittipankki-schema.sql - schema for creating a Postgres database
```

## Creating the database

To create database run kuittipankki-schema.sql sql script to kuittipankki database. File includes required queries to create all tables and foreign relations between tables. Script can be runned to database with next command:

```
psql -U kuittipankki -p kuittipankki -d kuittipankki -f kuittipankki-schema.sql
```

## Migrating data to Postgresql

Before running data-import.py script you have to install PostgresSQL server and create database. After that you can proceed and do the data importing from the old JSON files to the databae. To run data-import.py script some Python libraries need to be installed before running the script. After libraries are installed, you get where the actual data is imported from the JSON files. 

1. Installing kuittipankki-postgres-migration.py script dependencies
```
python setup.py install
```

2. Before running the script, there is a need configure database setting to `mingration-config.json` file. This gives all required information for the kuittipankki-postgres-migration.py script for the later steps. Just open the file with your favorit editor and make changes to file.

```
{
  "__db":"Database configurations",

  "db" : {
    "user": "kuittipankki", - postgres user
    "password": "kuittipankki", - postgres user password
    "host": "localhost", - postgres host
    "port": 5432, - postgres port
    "database": "kuittipankki" - postgres database
  },

  "__data":"These are relative or absolute path to resource files",

  "data" : {
    "filemeta": "data/file-meta.json",
    "receipts": "data/receipts.json",
    "users": "data/users.json"  
  },

  "logging": {
    "level": "INFO" - debugging level
  }
}
```


3. Next we can run `kuittipankki-postgres-migration.py`. Remember that script requires *python3.4*, so make sure that you are using the right python version. Running this script start copying data from the JSON files to the postgres database.

Run the command like this:

```
python3 kuittipankki-postgres-migration.py
```

After that you can confirm result by navigating to you database using ´psql´ application.

## Trouble Shooting

There is no any trouble here :)