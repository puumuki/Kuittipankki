var express        = require('express');
var router         = express.Router();

//var crypto         = require('crypto');
var _              = require('underscore');
var storage        = require('../storage-service').userStorage;

var authentication = require('./../authentication');

var userSchema     = require('../schemas/user.schema');
var jsonSchemaValidator = require('../schemas/schema-middleware')(userSchema);


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

  res.setHeader('Content-Type','application/json');

  storage.get(req.params.id, function(err, user) {

    if( err ) {
      return res.status(404).send(JSON.stringify(err));
    }

    if( user ) {

      user.username = req.body.username;
      user.lang = req.body.lang;

      storage.saveSync(req.params.id,user);

      res.send({
        id: user.id,
        username: user.username,
        lang: user.lang ? user.lang : 'fi'
      });

    } else {
      res.status(500);
      res.send({msg: "We should never end up here :<"});
    }
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

  storage.all(function(err, users) {

    if( err ) {
      return res.status(500).send({msg:"Something whent wrong", errors: err});
    }

    res.setHeader('Content-Type', 'application/json');

    var usersArray = _.map( users, function(user, key ) {
      return user;
    });

    res.send(JSON.stringify(usersArray));
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

  storage.get(req.params.id, function(err, data) {

    res.setHeader('Content-Type', 'application/json');

    if( err ) {
      res.status(404);
      res.send(JSON.stringify(err));
    } else {
      res.send(JSON.stringify(data));
    }
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

    storage.get(req.user.id, function(err, user) {

      if( err ) {
        return res.status(403).res.send({
          message: 'Session is expired'
        });
      }

      res.send({
        id: user.id,
        username: user.username,
        lang: user.lang ? user.lang : 'fi'
      });
    });
  } else {
    res.status(403);
    res.send({message:'Unauthrorized'});
  }
});

module.exports = router;
