var express        = require('express');

var authentication = require('./../authentication');
var logging        = require('../logging');
var contenType     = require('../contenttype');
var receiptDb      = require('../db/receipt.db');
var timeService    = require('../time-service');

var receiptSchema       = require('../schemas/receipt.schema');
var jsonSchemaValidator = require('../schemas/schema-middleware')(receiptSchema);

var router = express.Router();

//Set header 'Content-Type', 'application/json in all router routes
router.use(contenType);

function sanitize(req){
  req.sanitize('picture').escape();
  req.sanitize('store').escape();
  req.sanitize('warrantlyEndDate').escape();
  req.sanitize('registered').escape();
  req.sanitize('created').escape();
  req.sanitize('updated').escape();
  req.sanitize('purchaseDate').escape();
  req.sanitize('description');//Markdown content, has to support links and other content.
  req.sanitize('price').escape();
}

function errorHandler(req, res, error) {
  if( error.message === 'could not load data' ) {
    var msg = req.params.id ? 'Receipt is not found with a given id ' + req.params.id : 'No receipts found';
    res.status(404).send({message:msg});
  } else {
    logging.error('Error',error);
    res.status(500);
    res.send({});
  }
}

/* POST - Save receipt. */
router.post('/receipt', authentication.isAuthorized, jsonSchemaValidator, function(req, res) {

  sanitize(req);

  var errors = req.validationErrors();

  if( errors ) {
    res.status(400);
    res.send(JSON.stringify(errors));
  } else {
    logging.log('Saving a new Receipt resource', req.body.name);

    var receipt = req.body;
    receipt.user_id = req.user.userId;

    logging.info("RECEIPT", receipt);

    receiptDb.save( receipt ). then(function(_receipt) {
      logging.info("Receipt resource saved succefully, ", req.body.name );
      res.send(_receipt);
    }).fail( function( error ) {
      logging.error("Failed to save Receipt resource: " );
      logging.error("Body receipt: ", receipt);
      logging.error("Error: ", error);

      res.status(500).send({msg:"Internal error"});
    });

  }
});

/* PUT - Update receipt. */
router.put('/receipt/:id', authentication.isAuthorized, jsonSchemaValidator, function(req, res) {

  sanitize(req);

  receiptDb.find( req.params.id ).then(function(receipt) {

    var validationErrors = req.validationErrors();

    if( validationErrors ) {
      res.status(400);
      res.send(JSON.stringify(validationErrors));
    } else if(!receipt) {
      res.status(404);
      res.send({
        msg: "Receipt resource not found with given id" + req.params.id
      });
    } else {
      logging.info("Updating existing receipt resource", req.params.id, req.body.name);

      var _receipt = receipt;

      _receipt.name = req.body.name;
      _receipt.store = req.body.store;
      _receipt.tags = req.body.tags;
      _receipt.purchaseDate = timeService.parseDateTime(req.body.purchaseDate);
      _receipt.warrantlyEndDate = timeService.parseDateTime(req.body.warrantlyEndDate);
      _receipt.registered = timeService.parseDateTime(req.body.registered);
      _receipt.description = req.body.description;
      _receipt.price = req.body.price;

      receiptDb.update( _receipt ).then(function( receipt ) {
        res.send( receipt );
      }).catch( function( error ) {
        logging.info("Error while updating receipt resource", error);
        res.status(500);
        res.send({
          msg:"Internal server error"
        });
      });
    }

  }).catch(function(error) {
    logging.info("Error while updating file resource", error);
    res.status(500).send({
      msg:"Internal server error, error while updating file resource"
    });
  });

});

/* DELETE - Mark receipt deleted */
router.delete('/receipt/:receiptId', authentication.isAuthorized, function(req, res) {

  logging.info("Deleting Receipt resource");

  receiptDb.delete(req.params.receiptId).then(function(_receipt) {
    res.send(_receipt);
  }).fail(function( error ) {
    logging.error("Failed to delete Receipt resource", error );
    res.status(500).send({msg:'Internal server error'});
  });

});


/* GET - All receipts. */
router.get('/receipts', authentication.isAuthorized, function(req, res) {
  receiptDb.fetchReceipts( req.user.userId ).then(function(receiptJSON) {
    res.send( receiptJSON );
  }).fail(function( error ) {
    logging.send( error );
    res.status(500).send("Internal Error");
  });
});

/* GET - Get single receipt */
router.get('/receipt/:id', authentication.isAuthorized, function(req, res) {

  req.checkParams('id','Receipt ID is missing');

  receiptDb.find( req.params.id ).then((receipt) => {
    if( !receipt ) {
      res.status(404);
      res.send({message:"Receipt is not found with an id " + req.params.id});
    } else if( receipt.userId !== req.user.id ) {
      res.status(404);
      res.send({message:"Receipt is not found with an id " + req.params.id});
      logging.warn("Unauthorized access attempt to receipt that is not signed user own. "+
                      "The receipt id that is tried to access is " + req.params.id );
    } else {
      res.send(receipt);
    }

  }).catch((error) => {
    errorHandler(req, res, error);
  });
});

module.exports = router;
