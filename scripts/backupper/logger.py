import os
import logging
from logging.handlers import RotatingFileHandler
import settings

def _create_logger(path):
  logging.basicConfig(level=logging.DEBUG,
            format='%(asctime)s %(message)s',
            datefmt='%Y-%m-%d %H:%M',
            filemode='w')

  logger = logging.getLogger("Rotating Log")
  logger.setLevel(logging.INFO)
  handler = RotatingFileHandler(path, maxBytes=1024 * 10, backupCount=5)

  handler.setFormatter(logging.Formatter(fmt='%(asctime)s %(message)s', 
                       datefmt='%Y-%m-%d %H:%M'))

  logger.addHandler(handler)

  return logger

_logger = _create_logger(settings.LOG_PATH)

def get_logger():
  return _logger