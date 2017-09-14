
var Q      = require('q');
var models = require('../models');
var logging= require('../logging');
var objectService = require('../object-service');
var timeService = require('../time-service');

/**
 * Find single Tag resource
 *
 * @param {Integer} tagId
 * @return {Q.Promise}
 */
function find(tagId) {
  var defer = Q.defer();

  models.Tag.findTag(tagId).then(function(result) {
    defer.resolve( result ? result.toJSON() : null );
  }).catch(function(error) {
    logging.error( "Error fetching tag by id", error );
    defer.reject( error );
  });

  return defer.promise;
}

/**
 * Find all Tag resources for all receiptIds
 *
 * @param {Integer} receiptId
 * @return {Q.Promise}
 */
function findAll( receiptId ) {

  var defer = Q.defer();

  models.Tag.findAll({
    where: {
      receipt_id: receiptId,
      removed: false
    }
  }).then(function(files) {

    var json = files.map(function( file ) {
      return file.toJSON();
    });

    defer.resolve( json );

  }).catch(function(error) {
      logging.error("Error while finding files", error);
    defer.reject(error);
  });

  return defer.promise;
}

/**
 * Delete Tag resource, marks it removed at the database
 *
 * @param {Tag} tag model object
 * @return {Q.Promise}
 */
function deleteTag( tagId ) {

  var defer = Q.defer();

  models.Tag.findTag( tagId ).then(function(_tag) {
    if( !_tag ) {
      defer.resolve( null );
    } else {
      _tag.removed = true;
      _tag.save().then(defer.resolve)
                 .catch( defer.reject );
    }
  }).catch(defer.reject);

  return defer.promise;
}

/**
 * Update user Tag resource to database
 *
 * @param {Tag} tag model object
 * @return {Q.Promise}
 */
function update( tag ) {

  var defer = Q.defer();

  models.Tag.findTag( tag.tagId ).then(function(_tag) {

    if( _tag ) {
      var _json = _tag.toJSON();

      _json.name = tag.name;
      _json.receipt_id = tag.receiptId;

      _json.created_by = models.User.integrationUser.user_id;
      _json.updated_by = models.User.integrationUser.user_id;

      _json.updated_on = timeService.postgresCurrentTime();

      _tag.update( _json ).then(function( tag ) {
        defer.resolve( tag.toJSON() );
      }).catch(defer.reject);
    } else {
      defer.resolve( null );
    }

  }).catch(defer.reject);

  return defer.promise;
}

/**
 * Save user Tag resource to database
 *
 * @param {Tag} tag model object
 * @return {Q.Promise}
 */
function save( tag ) {

  var defer = Q.defer();

  var _json = objectService.underscoreObject( tag );

  _json.created_by = models.User.integrationUser.user_id;
  _json.updated_by = models.User.integrationUser.user_id;

  _json.created_on = timeService.postgresCurrentTime();
  _json.updated_on = timeService.postgresCurrentTime();

  models.Tag.create( _json ).then(function( tag ) {
    console.log( tag );
    defer.resolve( tag.toJSON() );
  }).catch(function(error) {
    console.log( error );
    defer.reject(error);
  });

  return defer.promise;
}

module.exports = {
  find: find,
  findAll: findAll,
  save: save,
  update: update,
  delete: deleteTag
};
