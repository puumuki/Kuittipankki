/**
 * Start Kuittipankki server application
 * Start by running command in terminal node index.js
 */
var logging = require('./logging');
var app = require('./app');
var settings = require('./settings');

var server = app.listen(settings.port, function () {
  var host = server.address().address;
  var port = server.address().port;
  logging.info('Kuittipankki starting at http://%s:%s', host, port);
});