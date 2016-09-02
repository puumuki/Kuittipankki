/**
 * Authentication module contains are things needed to authenticate users.
 */
var _ = require('underscore');
var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
var logging = require('./logging');
var storage = require('./storage-service').userStorage;

/**
 * Simple password hash check.
 * @param {object} user object
 * @param {string} password as plain text
 * @return {boolean} true is user is authenticated
 */
function matchpasswords( user, password ) {
  var shasum = crypto.createHash('sha1');
  shasum.update(password+user.salt);
  return user.password === shasum.digest('hex');
}

/**
 * Authentication strategy what is used with Passport middleware
 */
var authenticationStrategy = new LocalStrategy(
  function(username, password, done) {

    storage.all(function(err, users) {

      if(err) {
        logging.error(err);
      }

      var user = _.find( users, function(user) {
        return user.username.toLowerCase() === username.toLowerCase();
      });

      if(!user) {
        logging.info('User not found ');
        return done(null, false, {message:'User not found'});  
      } 
      else if(matchpasswords(user, password)) {
        logging.info('User ', user.username, ' authenticated');
        return done(null, {
          id: user.id,
          username: user.username
        });
      } else {
        logging.info('User ', user.username, ' authentication failed');
        return done(null, false, {message:'User not found'});  
      }     
    });
  }
);

function serializeUser(user, done) {
  done(null, user.id);
}

function deserializeUser(id, done) {
  storage.get(id, function(err, user) {
    done(err, user);
  });
}

function loginRouteResponse(req, res) {

  storage.get(req.session.passport.user, function(err, user) {

    if( err ) {
      logging.error('User not found', err);
      res.status(500);
      res.send({});
    } else {
      res.send({
        id: user.id,
        username: user.username
      });  
    }
  });
}

/**
 * Middleware that test is authenticated
 */
function isAuthorized(req, res, next) {
  if( !req.user ) {
    return res.status(403).send({message:'UnisAuthorized'});  
  } else {
    next();
  }  
}

module.exports = {
  serializeUser: serializeUser,
  deserializeUser: deserializeUser,
  authenticationStrategy: authenticationStrategy,
  loginRouteResponse:loginRouteResponse,
  isAuthorized: isAuthorized
};