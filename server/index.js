/**
 * Start Kuittipankki server application
 * Start by running command in terminal node index.js
 */
var logging      = require('./logging');
var app          = require('./app');
var settings     = require('./settings');
var path         = require('path');
var easypidfile  = require('easy-pid-file');
var models       = require('./models');

//Create a file stat srores process id
easypidfile( path.join( __dirname, 'kuittipankki.pid'));

models.sequelize.authenticate().then(() => {

  models.User.findById(1).then(function( integrationUser ) {

    //Expose interation user to server
    models.User.integrationUser = integrationUser;

    try {
    var server = app.listen(settings.port, function () {
      var host = server.address().address;
      var port = server.address().port;
      logging.info('Kuittipankki starting at http://%s:%s. Process ID %s', host, port, process.pid);
    });

    server.on('error', function(error) {
      console.log(error);
      if( error.code in errorHandler ) {
        errorHandler[error.code]( error );
      }
    });
  } catch( error ) {
    console.log( error );
  }



    /**
     * Shutdown server grafully as possible
     * @param {string} msg message printed when event is handled
     * @return {function} callback function
     */
    function shutdownServer(msg) {

      return function(error) {
        logging.info(msg);

        //Fixes problem with a server.close callback, that is not never called
        //if there is hanging connections.
        server._connections=0;

        server.close(function () {
          console.log('Shutdown');
          process.exit(0);
        });
      };
    }

    process.on('SIGTERM', shutdownServer('-- Server shutting down -- SIGTERM -- Process killed') );
    process.on('SIGINT', shutdownServer('-- Server shutting down -- SIGINT -- CTRL+C') );

    var errorHandler = {
      EADDRINUSE: function( error ) {
        logging.error('-- Server shutting down -- Server port is in use ' + error.port );
        process.exit(0);
      }
    };

  }).catch(function(error) {
    logging.error("Fatal error, could not find integration user", error);
  });

}).catch((error) => {
  console.log("Unable to connect database", error);
});




