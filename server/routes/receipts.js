var express        = require('express');
var _              = require('underscore');

var authentication = require('./../authentication');
var logging        = require('../logging');
var storage        = require('../storage-service').receiptStorage;
var fileService = require('../file-service');

var router = express.Router();

function sanitize(req){
  req.sanitize('picture').escape();
  req.sanitize('store').escape();
  req.sanitize('warrantlyEndDate').escape();
  req.sanitize('registered').escape();
  req.sanitize('created').escape();
  req.sanitize('updated').escape();
  req.sanitize('purchaseDate').escape();
  req.sanitize('description').escape();
  req.sanitize('price').escape();
}
  
function errorHandler(req, res, error) {
  logging.error('Error',error);
  res.status(500);
  res.send({});
}

/* POST - Save receipt. */
router.post('/receipt', authentication.isAuthorized, function(req, res) {

  if( !req.user ) {
    logging.error('Unauthorized access, trying to create a new receipt');
    return res.status(403).send({message:'Unauthorized'});
  }
  
  res.setHeader('Content-Type', 'application/json');

  sanitize(req);

  var errors = req.validationErrors();

  if( errors ) {
    res.status(400);
    res.send(JSON.stringify(errors));
  } else {
    logging.error('Saving a new receipt', req.body.name);
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

  storage.get(req.params.id, function(err, receipt) {

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

      logging.info('Updating old receipt', req.body.name);

      receipt.user_id = req.user.id;
      receipt.name = req.body.name;
      receipt.store = req.body.store;
      receipt.warrantlyEndDate = req.body.warrantlyEndDate;
      receipt.registered = req.body.registered;
      receipt.tags = req.body.tags;
      receipt.created = req.body.created;
      receipt.updated = req.body.updated;
      receipt.purchaseDate = req.body.purchaseDate;
      receipt.description = req.body.description;
      receipt.price = req.body.price;

      storage.saveSync(req.params.id,receipt);

      var files = fileService.loadFiles();
      receipt.pictures = fileService.filterFilesByReceiptID(receipt.id, files);

      res.send(JSON.stringify(receipt));
    }
  });
});

/* DELETE - Mark receipt deleted */
router.delete('/receipt/:id', authentication.isAuthorized, function(req, res) {

  res.setHeader('Content-Type', 'application/json');

  storage.get(req.params.id, function(err, receipt) {
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
      var files = fileService.loadFiles();

      var _receipts = _.chain(receipts).map(function(receipt, id) {
        receipt.files = fileService.filterFilesByReceiptID(receipt.id, files);
        return receipt;
      }).filter(function(receipt) {
        return (receipt.deleted === undefined || receipt.deleted === false) && receipt.user_id === req.user.id;
      }).value();

      res.send(_receipts);
    }
  });
});

/* GET - Get single receipt */
router.get('/receipt/:id', authentication.isAuthorized, function(req, res) {
  res.setHeader('Content-Type', 'application/json');

  req.checkParams('id','Receipt ID is missing');

  storage.get(req.params.id, function(err, receipt) {

    res.setHeader('Content-Type', 'application/json');
    
    var files = fileService.loadFiles();
    receipt.files = fileService.filterFilesByReceiptID(receipt.id, files);
    
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
