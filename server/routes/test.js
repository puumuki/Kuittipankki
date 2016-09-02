var express = require('express');
var logging = require('../logging');

var router = express.Router();

router.get('/createerror', function(req, res) {

  logging.error('Create server internall error');
  res.status(500);
  res.send({message:'Internall server error'});
 
});

router.get('/throwerror', function(req, res) {

  throw new Error('Test Error');

  //res.status(500);
  //res.send({message:'Internall server error'});
 
});


module.exports = router;