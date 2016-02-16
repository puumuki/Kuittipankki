#!/usr/bin/python
# -*- coding: utf-8 -*-
import os
from shutil import copy
from zipdir import zipdir
from datetime import datetime
from time import timezone

SOURCE = ""
LOCAL_BACKUP = ""
REMOTE_BACKUP = ""

FILE_SUFFIX = ""

def generate_path(destination):
  date = datetime.utcnow().strftime("%Y-%m-%d_%H-%M")
  return os.path.join(destination, "%s.%s" % (date,FILE_SUFFIX))

def dir_exist(path):
  return os.path.isdir(path) and os.path.exists(path)

def copy_to_remote(zip_path):
  if dir_exist(REMOTE_BACKUP):
    copy(zip_path, REMOTE_BACKUP)

def main(): 
  if dir_exist(SOURCE) and dir_exist(LOCAL_BACKUP):
    zip_path = generate_path(LOCAL_BACKUP)
    zipdir(SOURCE, zip_path)
    copy_to_remote(zip_path)

if __name__ == '__main__':
  main()