var Store = require("jfs");
var _ = require('underscore');
var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');

var storage = new Store('data/users.json', {saveId:true});

function matchpasswords( user, password ) {
  var shasum = crypto.createHash('sha1');
  shasum.update(password+user.salt);
  return user.password === shasum.digest('hex');
}

var authenticationStrategy = new LocalStrategy(
  function(username, password, done) {

    storage.all(function(err, users) {

      if(err) {
        console.log(err);
      }

      var user = _.find( users, function(user) {
        return user.username.toLowerCase() === username.toLowerCase();
      });

      if(!user) {
        console.info("User not found ")
        return done(null, false, {message:"User not found"});  
      } 
      else if(matchpasswords(user, password)) {
        console.log("User ", user.username, " authenticated");
        return done(null, {
          id: user.id,
          username: user.username
        });
      } else {
        console.log("User ", user.username, " authentication failed");
        return done(null, false, {message:"User not found"});  
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
      console.error("User not found", err);
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