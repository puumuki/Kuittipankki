/**
 * Kuittipankki application starting point
 */
var logging  = require('./logging');
var app      = require('./app');
var settings = require('./settings');

var server = app.listen(settings.port, function () {
  var host = server.address().address;
  var port = server.address().port;
  logging.info('Kuittipankki starting at http://%s:%s', host, port);
});