var express = require('express');
var router = express.Router();
var Store = require("jfs");
var crypto = require('crypto');
var _ = require('underscore');
var logging = require('../logging');
var dateutils = require('../dateutils');
var storage = new Store('data/users.json', {saveId:true});

/* POST - User */
router.post('/user', function(req, res) {

  var shasum = crypto.createHash('sha1');
  var salt = crypto.randomBytes(16).toString('hex');

  shasum.update(req.body.password+salt);
  var password = shasum.digest('hex');

  var user = {
    username: req.body.username,
    password: password,
    salt: salt,
    created: dateutils.currentDateTime(),
    updated: dateutils.currentDateTime()
  };

  var id = storage.saveSync(user);

  res.setHeader('Content-Type','application/json');
  res.send({ id: id, username: req.body.username });
});

/* PUT - User */
router.put('/user/:id', function(req, res) {

  if( !req.user ) {
    return res.status(403).send({message:'Unauthorized'});
  }

  //User only modify his own information
  if( req.user.id !== req.params['id'] ) {
    return res.status(403).send({message:'Unauthorized'});
  }

  res.setHeader('Content-Type','application/json');

  storage.get(req.params['id'], function(err, user) { 

    if( user ) {

      user.username = req.body.username;
      user.updated = dateutils.currentDateTime();

      storage.saveSync(req.params['id'],user);
 
      req.user.username = req.body.username;
      req.user.updated = req.body.updated;
      
      res.send({ id: user.id, 
                 username: user.username, 
                 created: user.created, 
                 updated:user.updated });

    } else {
      res.status(404);
      res.send({});
    }  
  });

});

/* GET - All users. */
/*router.get('/users', function(req, res) {

  if( !req.user ) {
    return res.status(403).send({message:'Unauthorized'});
  }

  storage.all(function(err, users) {
    res.setHeader('Content-Type', 'application/json');

    var usersArray = _.map( users, function(user, key ) {
      return user;
    });

    res.send(JSON.stringify(usersArray));
  });
});*/

/* GET - Single user */
router.get('/user/:id', function(req, res) {

  if( !req.user ) {
    return res.status(403).send({message:'Unauthorized'});
  }

  storage.get(req.params['id'], function(err, data) {
    
    res.setHeader('Content-Type', 'application/json');

    if( err ) {
      res.status(404); 
      res.send(JSON.stringify(err));
    } else {
      res.send(JSON.stringify(data));
    }
  });
});

/* GET - Authenticated user */
router.get('/userauthenticated', function(req, res) {

  if( !req.user ) {
    return res.status(403).send({message:'Unauthorized'});
  }

  res.setHeader('Content-Type', 'application/json');

  if( req.user ) {
    storage.get(req.user.id, function(err, user) {

      if( err ) {
        res.status(404)
        res.send({"message":"Not found"});
        logging.error("Error on fetching authenticated user",err);        
      } else {
        res.send({
          id: user.id,
          username: user.username,
          created: user.created,
          updated: user.updated
        });        
      }
    });
  } else {
    res.status(403);
    res.send({message:'Unauthrorized'});
  }
});

module.exports = router;
