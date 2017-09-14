
var Q      = require('q');
var models = require('../models');
var logging= require('../logging');
var objectService = require('../object-service');
var timeService = require('../time-service');

function find( fileId ) {
  var defer = Q.defer();

  models.File.findById(fileId).then(function(result) {
    defer.resolve( result ? result.toJSON() : null );
  }).catch(function(error) {
    logging.error( "Error fetching file by id", error );
    defer.reject( error );
  });

  return defer.promise;
}

function findAll( receiptId ) {

  var defer = Q.defer();

  models.File.findAll({
    where: {
      receipt_id: receiptId,
      removed: false
    }
  }).then(function(files) {

    var json = files.map(function( files ) {
      return files.toJSON();
    });

    defer.resolve( json );

  }).catch(function(error) {
    logging.error("Error while finding receipts", error);
    defer.reject(error);
  });

  return defer.promise;
}

function save( file ) {
  var defer = Q.defer();

  var _json = objectService.underscoreObject( file );

  _json.created_by = models.User.integrationUser.user_id;
  _json.updated_by = models.User.integrationUser.user_id;

  _json.created_on = timeService.postgresCurrentTime();
  _json.updated_on = timeService.postgresCurrentTime();

  models.File.create( _json ).then(function( _file ) {
    logging.info("File saved to database");
    defer.resolve( _file.toJSON() );
  }).catch(function(error) {
    console.log( error );
    defer.reject( error );
  });

  return defer.promise;
}


function update() {}

function deleteFile( fileId ) {
  var defer = Q.defer();

  models.File.findById( fileId ).then(function(_file) {
    if( !_file ) {
      defer.resolve( null );
    } else {
      _file.removed = true;
      _file.save().then(defer.resolve)
                 .catch( defer.reject );
    }
  }).catch(defer.reject);

  return defer.promise;
}

module.exports = {
  find: find,
  findAll: findAll,
  save: save,
  update: update,
  delete: deleteFile
};
