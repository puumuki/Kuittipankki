/**
 * Authentication module contains are things needed to authenticate users.
 */
var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
var logging = require('./logging');
var userDb = require('./db/user.db');
var receiptDb = require('./db/receipt.db');

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

    userDb.fetchUserByUsername( username ).then(function(user) {

      if(!user) {
        logging.info('User not found ');
        return done(null, false, {message:'User not found'});
      }
      else if(matchpasswords(user, password)) {
        logging.info('User ', user.username, ' authenticated');

        return done(null, {
          id: user.user_id,
          username: user.username,
          lang: user.lang
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

function deserializeUser(user_id, done) {
  userDb.find( user_id ).then(function(user) {
    done(null, {
      userId: user.user_id,
      username: user.username,
      lang: user.lang
    });
  }).fail(function(error) {
    done(error, null);
  });
}

function loginRouteResponse(req, res) {

  userDb.find( req.session.passport.user ).then(function(user) {
    res.send({
      userId: user.user_id,
      username: user.username,
      lang: user.lang
    });
  }).catch(function(error) {
      logging.error('User not found', error);
      res.status(500);
      res.send({});
  });
}

/**
 * Middleware that test is authenticated
 */
function isAuthorized(req, res, next) {
  if( !req.user ) {
    return res.status(403).send({msg:'Unauthorized access, please login before use the resource.'});
  } else {
    next();
  }
}

/**
 * Middleware that check is user authenticated and has an access to check receipt
 */
function isAuthorizedReceipt(req, res, next) {

  if( !req.params.receiptId ) {
    logging.error("Expected parameter receiptId is missing, please check that you are using function correctly");
    return res.status(403).send({msg:'Expected parameter receiptId is missing'});
  }

  receiptDb.findReceipt( req.params.receiptId ).then(function( receipt ) {

    if( req.user && req.user.userId === receipt.user_id ) {
      next();
    } else {
      return res.status(403).send({msg:'Unauthorized access, please login before use the resource.'});
    }

  }).catch((error) => {
    logging.error("Error while checking iaAuthorizedReceipt()", error);
    res.status(500).send("Internal server error");
  });
}

module.exports = {
  serializeUser: serializeUser,
  deserializeUser: deserializeUser,
  authenticationStrategy: authenticationStrategy,
  loginRouteResponse:loginRouteResponse,
  isAuthorized: isAuthorized,
  isAuthorizedReceipt: isAuthorizedReceipt
};
