var settings = require('./settings');
var winston = require('winston');

winston.level = settings.logging.level;

winston.add(winston.transports.File, {
  filename: settings.logging.filename
});

module.exports = winston;