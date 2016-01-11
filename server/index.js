var logging = require('./logging')
var app = require('./app');

var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;
  logging.info('Kuittipankki starting at http://%s:%s', host, port);
});