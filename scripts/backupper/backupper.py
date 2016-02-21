#!/usr/bin/python
# -*- coding: utf-8 -*-
import os
import glob
from shutil import copy
from zipdir import zipdir
from datetime import datetime
import logger
import settings
import tempfile
import shutil

logger = logger.get_logger()

#Message decorator
def message(message, arguments=True, line=False):
  def _wrapper(func):
    def _func_wrapper(*args):
      msg = message
      if arguments:
        msg = message % args
      logger.info(msg)

      if line:
        logger.info('------------' * 5)

      return func(*args)
    return _func_wrapper
  return _wrapper

def date():
  return datetime.utcnow().strftime("%Y-%m-%d %H:%M")

class ValidationError(Exception):
  pass

@message('Validating settings', arguments=False)
def validate_settings(targets, temp_location, backup_directory):

  def dir_exist(path):
    return os.path.isdir(path) and os.path.exists(path)

  def targets_exist(targets):
    return all(map(dir_exist, targets))

  errors = []

  if not targets_exist(targets):
    errors.append(("Some of target directories don't exist, please check paths:\n" + "\n".join(targets) ))
  if not dir_exist(temp_location):
    errors.append(("Temponary directory location don't exist, please check the path:\n" + temp_location))
  if not dir_exist(backup_directory):
    errors.append(("Local backup directory don't exist, please check backup directory path:\n", backup_directory))

  if len(errors) > 0:
    raise ValidationError(errors)

def get_size(start_path = '.'):
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(start_path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            total_size += os.path.getsize(fp)
    return total_size

def get_orginal_and_compressed_file_size( target, destination ):
  
  orginal_size = get_size( target )
  compressed_size = os.stat(destination).st_size
  comperssion_ratio = float(compressed_size) / float(orginal_size)
  
  return {
    "orginal_size":orginal_size, 
    "compressed_size":compressed_size, 
    "comperssion_ratio":comperssion_ratio
  }

@message('Stopping backup process', arguments=False)
def show_errors( validation_exeption ):
  for message in validation_exeption.message:
    logger.info(message)

@message("Starting backingup procedure", arguments=False)
def backup(targets, temp_location, backup_directory):

  def generate_path(destination, prefix, suffix):
    date = datetime.utcnow().strftime("%Y-%m-%d_%H-%M")
    return os.path.join(destination, "%s.%s.%s" % (prefix,date,suffix))

  @message("Zipping target %s to a tempanary location %s")
  def zip_directory(target, destination):
    zipdir(target, destination )
    result = get_orginal_and_compressed_file_size( target, destination )
    logger.info( "Target orginal size: %s kib, compressed size: %s kib, compression ratio: %s" % (
      result.get('orginal_size') / 1024.0, result.get('compressed_size') / 1024.0, result.get('comperssion_ratio')
    ))

  @message("Making final backup, zipping files in the temponary location %s to %s")
  def final_zip(target, destination):
    zipdir(target, destination)

  for target in targets:
    dirname = os.path.basename(target)
    zip_path = generate_path(temp_location, dirname, 'kuittipankki.zip')
    zip_directory(target, zip_path)

  backup_file_path = generate_path( backup_directory, 'kuittipankki', 'zip' )
  final_zip( temp_location, backup_file_path )

@message("Cleaning tempanary loction: %s", line=True)
def clean( location ):
  filelist = glob.glob(os.path.join( location, "*.zip") )
  for f in filelist:
    os.remove(f)
  shutil.rmtree(location)

@message("Creating temponary directory")
def make_temponary_directory():
  return tempfile.mkdtemp(prefix='tmp')      

@message('Starting backing up process', arguments=False, line=True)
def main():
  temponary_directory = make_temponary_directory()
  try:
    validate_settings( settings.TARGETS, temponary_directory, settings.BACKUP_DIRECTORY )
    backup( settings.TARGETS, temponary_directory, settings.BACKUP_DIRECTORY )
  except ValidationError as error:
    show_errors( error )
  finally:
    clean( temponary_directory )

if __name__ == '__main__':
  main()