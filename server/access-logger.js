var fs                = require('fs');
var morgan            = require('morgan');
var FileStreamRotator = require('file-stream-rotator');
var settings          = require('./settings');
var path              = require('path');

var logDirectory = settings.log_directory;

// ensure log directory exists
if( !fs.existsSync(logDirectory) ) {
  fs.mkdirSync(logDirectory);
}
// create a rotating write stream
var accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYY-MM-DD',
  filename: path.join(logDirectory, 'access-%DATE%.log'),
  frequency: 'daily',
  verbose: false
});

module.exports = morgan('combined', {stream: accessLogStream});

