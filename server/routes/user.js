var express        = require('express');

//var crypto         = require('crypto');
var _              = require('underscore');

var authentication = require('./../authentication');
var contenType     = require('../contenttype');

var userSchema     = require('../schemas/user.schema');
var jsonSchemaValidator = require('../schemas/schema-middleware')(userSchema);
var userDb         = require('../db/user.db');
var logging             = require('../logging');

var router         = express.Router();

//Set header 'Content-Type', 'application/json in all router routes
router.use(contenType);

//TODO validointi, autentikointi
//https://github.com/flosse/json-file-store


/* POST - User */
/*router.post('/user', function(req, res) {

  var shasum = crypto.createHash('sha1');
  var salt = crypto.randomBytes(16).toString('hex');

  shasum.update(req.body.password+salt);
  var password = shasum.digest('hex');

  var user = {
    username: req.body.username,
    password: password,
    salt: salt,
    lang: 'fi'
  };

  var id = storage.saveSync(user);

  res.setHeader('Content-Type','application/json');
  res.send({ id: id, username: req.body.username });
});*/

/**
 * Update existing user information. Route requires an
 * authentication, if authentication is not available 403
 * HTTP status code is returned. If a user that is tryed to
 * update don't exist 404 (not found) HTTP status code is returned.
 * Request is validated against JSON-schema. If a request is not
 * valid 400 (bad request) HTTP status code is returned with a
 * validation error message.
 *
 * Pass the JSON
 * in a request body part. Required field are id, username and lang.
 *
 * @queryparam {string} id, user id number to be updated
 * @method PUT
 */
router.put('/user/:id', authentication.isAuthorized, jsonSchemaValidator, function(req, res) {

  userDb.find(req.params.id).then(function( user ) {

    if( user ) {

      user.username= req.body.username;
      user.lang = req.body.lang;

      userDb.save(user).then(function(user) {
        res.send(user.toJSON());
      }).catch(function(error) {
        res.status(400).send( error );
      });

    } else {

      res.status(404).send({
        msg: "User resource not found"
      });
    }

  }).catch(function(error) {
      logging.error("Error while updating user resource", req.params.id, error);
      res.status(500);
      res.send({msg: "Internal server error"});
  });

});

/**
 * Return all users informations as an JSON array. Method requires
 * authentication, if no authentication available return 403 HTTP
 * status code to a request.
 *
 * @method GET
 */
router.get('/users', authentication.isAuthorized, function(req, res) {

  userDb.findAll().then(function(users) {

    try {
      var _users = _.map( users, function(user) {
        return user.toJSON();
      });
      res.send(_users);
    } catch(error) {
      logging.error( "Error while fetching users from the database", error );
      res.status(500).send({
        msg: "Internal server error"
      });
    }

  }).catch(function(error) {
    res.status(500).send({msg:"Something whent wrong", errors: error});
  });

});

/**
 * Return single user's informations as a JSON object. Method
 * requires authentication, if no authenticated return 403 HTTP status code.
 * If queried if user is not found returns 404 HTTP status code.
 *
 * @queryparam {string} id, userId whos informations is fetched
 * @method GET
 */
router.get('/user/:id', authentication.isAuthorized, function(req, res) {

  userDb.find(req.params.id).then(function(user) {
    if( !user ) {
      res.status(404);
      res.send({message:"User not found"});
    } else {
      res.send(user.toJSON());
    }
  }).catch(function(error) {
    logging.error("Error fetching /user/:", req.params.id, error );
    res.status(500).send({
      message: "Internal server error"
    });
  });

});

/**
 * Check is authenticated user's session still alive. Return
 * 200 HTTP status code if session is still alive, otherwise
 * return 403 status code.
 *
 * @method GET
 */
router.get('/userauthenticated', function(req, res) {
  if( req.user ) {

    userDb.find( req.user.userId ).then(function(user) {

      if( user ) {
        res.send(user.toJSON());
      } else {
        res.status(403);
        res.send({message:'Unauthrorized'});
      }

    }).fail(function(error) {
      return res.status(403).res.send({
        message: 'Session is expired'
      });
    });
  }

});

module.exports = router;
