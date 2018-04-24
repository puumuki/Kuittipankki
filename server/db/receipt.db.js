/**
 * Module contains logic for fetching, updating, inserting and deleting receipts in the database.
 */
var Q      = require('q');
var util   = require('util');
var models = require('../models');
var _ = require('underscore');
var objectService = require('../object-service');

var timeService = require('../time-service');
var fileUtils = require('../file-utils');

function findReceiptTags( receiptId ) {
  return models.sequelize.query( "SELECT * FROM tag WHERE receipt_id = :receipt_id AND removed = false;" , {
    replacements: { receipt_id: receiptId }, type: models.sequelize.QueryTypes.SELECT
  });
}

function findReceiptFiles( receiptId ) {
  return models.sequelize.query( "SELECT * FROM file WHERE receipt_id = :receipt_id AND removed = false;", {
    replacements: { receipt_id: receiptId }, type: models.sequelize.QueryTypes.SELECT
  });
}

/**
 * Update receipt at database, validates it before insert/update the row and
 * return Promise.
 * @param {object} receipt object
 * @return {Q.Promise}
 */
function update( receipt ) {

  var defer = Q.defer();

  models.Receipt.findById( receipt.receiptId ).then(function(receiptModel) {

    let _json = objectService.underscoreObject( receipt );

    _json.updated_on = timeService.postgresCurrentTime();

    receiptModel.update( _json ).then(function( receiptModel ) {

      let tagPromise = findReceiptTags(receiptModel.receipt_id);
      let filePromise = findReceiptFiles(receiptModel.receipt_id);

      models.sequelize.Promise.all([ tagPromise, filePromise ]).spread(function(tags, files) {

        var json = receiptModel.toJSON();

        json.tags = _.map( tags, objectService.camelizeObject );
        json.files = _.map( files, function( file ) {
          file.thumbnail = fileUtils.getFileTypeThumbnail( file.mimetype, file.filename );
          return objectService.camelizeObject( file );
        });

        defer.resolve( json );
      }).catch(function(error) {
        defer.reject( error );
      });

    }).catch( function(error) {
      console.log( error );
      defer.reject(error);
    });

  }).catch(function(error) {
    console.log( error );
    defer.reject(error);
  });

  return defer.promise;
}

/**
 * Save a Receipt resource
 * @param {object} Receipt object
 * @return {Q.Promise} promise object is resolved with saved object
 */
function save( receipt ) {
  var defer = Q.defer();

  let _json = objectService.underscoreObject( receipt );

  _json.created_by = models.User.integrationUser.user_id;
  _json.updated_by = models.User.integrationUser.user_id;

  _json.created_on = timeService.postgresCurrentTime();
  _json.updated_on = timeService.postgresCurrentTime();

  models.Receipt.create( _json ).then(function( receiptModel ) {

    let tagPromise = findReceiptTags(receiptModel.receipt_id);
    let filePromise = findReceiptFiles(receiptModel.receipt_id);

    models.sequelize.Promise.all([ tagPromise, filePromise ]).spread(function(tags, files) {

      var json = receiptModel.toJSON();

      json.tags = _.map( tags, objectService.camelizeObject );
      json.files = _.map( files, function( file ) {
        file.thumbnail = fileUtils.getFileTypeThumbnail( file.mimetype, file.filename );
        return objectService.camelizeObject( file );
      });

      defer.resolve( json );
    }).catch(function(error) {
      defer.reject( error );
    });

  }).catch( function(error) {
    console.log( error );
    defer.reject(error);
  });

  return defer.promise;
}

/**
 * Find a Receipt resource
 *
 * @param {integer} receiptId, receipt id number
 * @return {Q.Promise} promise is resolved with Receipt resource object
 *                     or null if receipt resouce is not found.
 */
function find( receiptId ) {

  var deferred = Q.defer();

  models.Receipt.findById( receiptId ).then(function( receipt ) {

    //Receipt found from the database
    if( receipt ) {
      var tagPromise = findReceiptTags( receiptId );
      var filePromise = findReceiptFiles( receiptId );

      models.sequelize.Promise.all([ tagPromise, filePromise ]).spread(function(tags, files) {

        var receiptJSON = receipt.toJSON();

        receiptJSON.tags = _.map( tags, objectService.camelizeObject );

        receiptJSON.files = _.map( files, function( file ) {
          file.thumbnail = fileUtils.getFileTypeThumbnail( file.mimetype, file.filename );
          return objectService.camelizeObject( file );
        });

        deferred.resolve( receiptJSON );

      }).catch(function(error) {
        deferred.reject( error );
      });
    }

    //Receipt not found from the database
    else {
      deferred.resolve( null );
    }

  }).catch(function( error ) {
    deferred.reject( error );
  });

  return deferred.promise;
}

/**
 * Fetch receipts from the database for the given user
 * @param {integer} userId
 * @return {Q.Promise} promise, promise is resoved with user JSON
 */
function fetchReceipts( userId ) {

  var deferred = Q.defer();

  let query = util.format("SELECT * FROM receipt WHERE user_id = %s AND removed=false;", userId);

  models.sequelize.query( query ).then( function(result, metadata ) {

    var receipts = result[0];

    var receiptIds = receipts.map(function( receipt ) {
      return receipt.receipt_id;
    });

    //If user has no any receipts, we resolve promises with empty arrays.
    //Simplifies lot of writing those native SQL queries
    var  tagPromise = Promise.resolve([[]]);
    var  filePromise = Promise.resolve([[]]);

    if( receiptIds.length > 0 ) {
      var tagQuery = "SELECT * FROM tag WHERE receipt_id in ( %s ) AND removed=false;";
      tagQuery = util.format( tagQuery, receiptIds );
      tagPromise = models.sequelize.query( tagQuery );

      var fileQuery = "SELECT * FROM file WHERE receipt_id in ( %s ) AND removed=false;";
      fileQuery = util.format( fileQuery, receiptIds );
      filePromise = models.sequelize.query( fileQuery );
    }

    models.sequelize.Promise.all([ tagPromise, filePromise ])
      .spread(function( tagsResult, fileResult ) {

      var tags = tagsResult[0];
      var files = fileResult[0];

      var receiptsJSON = receipts.map( function(receipt) {

        var json = objectService.camelizeObject( receipt );

        var _tags = tags.filter(function( tag ) {
          return tag.receipt_id === receipt.receiptId;
        });

        json.tags = _tags.map(function( tag ) {
          return objectService.camelizeObject( tag );
        });

        var _files = files.filter(function( file ) {
          return file.receipt_id === receipt.receiptId;
        });

        json.files = _files.map(function(file) {
          file.thumbnail = fileUtils.getFileTypeThumbnail( file.mimetype, file.filename );
          return objectService.camelizeObject( file );
        });

        return json;
      });

      deferred.resolve( receiptsJSON );

    }).catch( deferred.reject );

  }).catch(function(error) {

    console.log( error );
  });

  return deferred.promise;
}

function deleteReceipt( receiptId ) {

  var defer = Q.defer();

  models.Receipt.findById( receiptId ).then(function(_repeipt) {
    //TODO: include files and tags
    if( _repeipt ) {
      _repeipt.removed = true;
      _repeipt.save()
              .then(function() {
                defer.resolve(_repeipt.toJSON());
              }).catch(defer.reject);
    } else {
      defer.resolve( null );
    }

  }).catch( defer.reject );

  return defer.promise;
}

module.exports = {
  fetchReceipts: fetchReceipts,
  find: find,
  update: update,
  delete: deleteReceipt,
  save: save
};



