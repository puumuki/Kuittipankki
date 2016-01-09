var express = require('express');
var router = express.Router();
var Store = require("jfs");
var crypto = require('crypto');
var _ = require('underscore');

//TODO validointi, autentikointi
//https://github.com/flosse/json-file-store

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
    salt: salt
  };

  var id = storage.saveSync(user);

  res.setHeader('Content-Type','application/json');
  res.send({ id: id, username: req.body.username });
});

/* PUT - User */
router.put('/user/:id', function(req, res) {

  res.setHeader('Content-Type','application/json');

  var user = storage.get(req.params['id'], function(err, user) {   
    if( user ) {
      user.username = req.body.username;
      storage.saveSync(req.params['id'],user);
      res.send({ id: user.id, username: user.username });
    } else {
      res.status(404);
      res.send({});
    }  
  });

});

/* GET - All users. */
router.get('/users', function(req, res) {
  storage.all(function(err, users) {
    res.setHeader('Content-Type', 'application/json');

    var usersArray = _.map( users, function(user, key ) {
      return user;
    });

    res.send(JSON.stringify(usersArray));
  });
});

/* GET - Single user */
router.get('/user/:id', function(req, res) {

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

module.exports = router;
