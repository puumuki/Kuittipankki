/**
 * Module contains logic for fetching, updating, inserting and deleting receipts in the database.
 */
var Q      = require('q');
var models = require('../models');
var logging= require('../logging');


function find( userId ) {
  var defer = Q.defer();

  models.User.findById(userId).then(function(result) {
    defer.resolve( result );
  }).catch(function(error) {
    logging.error( "Error fetching user by username", error );
    defer.reject( error );
  });

  return defer.promise;
}

function findAll() {
  var defer = Q.defer();

  models.User.findAll().then(function(result) {
    defer.resolve( result );
  }).catch(function(error) {
    logging.error( "Error fetching user by username", error );
    defer.reject( error );
  });

  return defer.promise;
}

/**
 * Update user at databse, validates it before insert/update the row and
 * return Promise.
 * @param {User} user model object
 * @return {Q.Promise}
 */
function save( user ) {
  var defer = Q.defer();

  user.save().then(function( user ) {
    defer.resolve(user);
  }).catch(function(error) {
    defer.reject(error);
  });

  return defer.promise;
}

/**
 * Find a user from the database for a given username.
 * In a user is found or not promise is resolved with the result.
 * Only in a case on an error promise is rejected. So error is an error.
 *
 * @param {string} username
 * @return {Q.Promise} promise, resolved with User object or null, rejected only case on an error.
 */
function fetchUserByUsername(username) {

  var defer = Q.defer();

  models.User.findOne({
    where: {
      username: username,
    }
  }).then(function(result) {
    defer.resolve( result );
  }).catch(function(error) {
    logging.error( "Error fetching user by username", error );
    defer.reject();
  });

  return defer.promise;
}


module.exports = {
  fetchUserByUsername: fetchUserByUsername,
  find: find,
  findAll: findAll,
  save: save
};
