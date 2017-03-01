var path = require('path');
var settings = require('./settings');
var winston = require('winston');

winston.level = settings.logging.level;

winston.add(winston.transports.File, {
  filename: path.join( settings.log_directory, settings.logging.filename )
});

module.exports = winston;
