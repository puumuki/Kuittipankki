var express = require('express');

var Store = require("jfs");
var _ = require('underscore');
var validator = require('validator');
var fs = require('fs');
var path = require('path');
var authentication = require('./../authentication');

var storage = new Store('data/receipts.json', {saveId:true});
var router = express.Router();

/**
 * Load pictures all pictures
 */
function loadPictures() {
  const fileTypes = ['bmp','png','jpg'];

  var files = fs.readdirSync(path.join(__dirname,'..','pictures'));

  files = _.filter(files, function(file) {
    var parts = file.split('.');
    var fileType = _.last(parts);
    return _.indexOf( fileTypes, fileType ) >= 0;
  })

  return _.map( files, function(filename) {
    return {
      filename: filename,
      thumbnail: 'thumbnail.' + filename,
      size: fs.statSync(path.join(__dirname,'..','pictures', filename)).size
    };
  });
}

function filterPicturesByID(id, files) {
  return _.filter(files, function(file) {
    var parts = file.filename.split('.');
    return _.first(parts) === id;
  });
}

//TODO: Siirrä validoinnin virhekäsittely middlewarelle
//TODO: Tarkista pystyykö kuitin etsimistä siirtämään middlewarelle

function sanitize(req){
  req.sanitize('picture').escape();
  req.sanitize('store').escape();
  req.sanitize('warrantlyEndDate').escape();
  req.sanitize('registered').escape();
  req.sanitize('created').escape();
  req.sanitize('updated').escape();
  req.sanitize('purchaseDate').escape();
  req.sanitize('description').escape();
}

function validate(req) {
  req.checkBody('picture').isURL();
  req.checkBody('warrantlyEndDate').isDate();
  req.checkBody('registered').isDate();
  req.checkBody('created').isDate();
  req.checkBody('updated').isDate();
  req.checkBody('purchaseDate').isDate();
}
  
function errorHandler(req, res, error) {
  console.error("Error",error);
  res.status(500);
  res.send({});
}

/* POST - Save receipt. */
router.post('/receipt', authentication.isAuthorized, function(req, res) {

  if( !req.user ) {
    return res.status(403).send({message:'Unauthorized'});
  }
  
  res.setHeader('Content-Type', 'application/json');

  sanitize(req);

  var errors = req.validationErrors()

  if( errors ) {
    res.status(400);
    res.send(JSON.stringify(errors));
  } else {
      var receipt = req.body;
      receipt.user_id = req.user.id;
      var id = storage.saveSync(receipt);
      receipt.id = id;
      res.send(JSON.stringify( receipt ));
  }  
});

/* PUT - Update receipt. */
router.put('/receipt/:id', authentication.isAuthorized, function(req, res) {

  if( !req.user ) {
    return res.status(403).send({message:'Unauthorized'});
  }

  res.setHeader('Content-Type', 'application/json');
  
  sanitize(req);
  
  req.checkParams('id','Receipt ID is missing');

  storage.get(req.params['id'], function(err, receipt) {

    var validationErrors = req.validationErrors();

    if(err) {
      errorHandler(req, res, err);
    } else if(validationErrors) {
      res.status(400);
      res.send(JSON.stringify(validationErrors));
    } else if(!receipt) {
      res.status(404);
      res.send({});
    } else {
      
      receipt.user_id = req.user.id;
      receipt.name = req.body.name;
      receipt.picture = req.body.picture;
      receipt.store = req.body.store;
      receipt.warrantlyEndDate = req.body.warrantlyEndDate;
      receipt.registered = req.body.registered;
      receipt.tags = req.body.tags;
      receipt.created = req.body.created;
      receipt.updated = req.body.updated;
      receipt.purchaseDate = req.body.purchaseDate;
      receipt.description = req.body.description;

      storage.saveSync(req.params['id'],receipt);

      res.send(JSON.stringify(receipt));
    }
  });
});

/* DELETE - Mark receipt deleted */
router.delete('/receipt/:id', authentication.isAuthorized, function(req, res) {

  res.setHeader('Content-Type', 'application/json');

  storage.get(req.params['id'], function(err, receipt) {
    receipt.deleted = true;
    storage.saveSync(receipt.id, receipt);
    res.send(receipt);
  });
});

/* GET - All receipts. */
router.get('/receipts', authentication.isAuthorized, function(req, res) {
  
  res.setHeader('Content-Type', 'application/json');

  storage.all(function(err, receipts) {
    if( err ) {
      errorHandler(req, res, err);
    } else {
      var files = loadPictures();

      var receipts = _.chain(receipts).map(function(receipt, id) {
        receipt.pictures = filterPicturesByID(receipt.id, files);
        return receipt;
      }).filter(function(receipt) {
        return (receipt.deleted === undefined || receipt.deleted === false) && receipt.user_id === req.user.id;
      }).value();

      res.send(receipts);
    }
  });
});

/* GET - Get single receipt */
router.get('/receipt/:id', authentication.isAuthorized, function(req, res) {
  res.setHeader('Content-Type', 'application/json');

  req.checkParams('id','Receipt ID is missing');

  storage.get(req.params['id'], function(err, receipt) {

    res.setHeader('Content-Type', 'application/json');
    
    receipt.pictures = filterPicturesByID(receipt.id, loadPictures());
    
    if( err ) {
      errorHandler(req, res, err);
    } else if( !receipt ) {
      res.status(404); 
      res.send(JSON.stringify(err));
    } else if( receipt.user_id !== req.user.id ) {
      res.status(403);
      res.send({});
    } else {
      res.send(JSON.stringify(receipt));
    }
  });
});

/* GET - Get single random receipt */
router.get('/receipt', authentication.isAuthorized, function(req, res) {
  res.setHeader('Content-Type', 'application/json');

  storage.all(function(err, data) {
    
    res.setHeader('Content-Type', 'application/json');

    if( err ) {
      errorHandler(req, res, err);
    } else if( !data ) {
      res.status(404); 
      res.send(JSON.stringify(err));
    } else {
      res.send(JSON.stringify(data));
    }
  });
});

module.exports = router;
