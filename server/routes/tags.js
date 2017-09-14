var express             = require('express');

var contenType          = require('../contenttype');

var tagSchema           = require('../schemas/tag.schema');
var jsonSchemaValidator = require('../schemas/schema-middleware')(tagSchema);

var tagDb               = require('../db/tag.db');
var logging             = require('../logging');

var router = express.Router();

router.use( contenType );

router.get('/tag/:id', function(req,res) {

  if( !Number.isInteger(parseInt(req.params.id)) ) {
    return res.status(400).send({
      msg: "Method url: /tag/:tagId, the param tagId has to be an integer number"
    });
  }

  tagDb.find( req.params.id ).then(function( tag ) {
    if( tag ) {
      res.send( tag );
    } else {
      res.status(404).send({
        msg: "Tag resource not found"
      });
    }
  }).fail(function( error ) {
    logging.error("Error while fethcing tag resource", req.params.id, error);
    res.status(500).send("Server internal error");
  });

});

router.get('/tags/:receiptId', function(req,res) {
  var receiptId = req.params.receiptId;

  tagDb.findAll( receiptId ).then(function( receipts ) {
    res.send( receipts );
  }).fail(function(error) {
    res.status(500).send({
      msg: "Error while finding tags for receipt " + receiptId
    });
  });

});

router.delete('/tag/:tagId', function(req,res) {

  var tagId = req.params.tagId;

  if( !Number.isInteger(parseInt(tagId)) ) {
    return res.status(400).send({
      msg: "Method url: /tag/:tagId, the param tagId has to be an integer number"
    });
  }

  tagDb.delete( tagId ).then(function( tag ) {
    if( tag ) {
      res.send( tag );
    } else {
      res.status(404).send({msg:"Tag resource not found"});
    }
  }).fail(function( error ) {
    logging.error("Error occurred while deleting Tag resource " + tagId, error);
    res.status(500).send({
      msg: "Internal error occurred"
    });
  });

});

router.put('/tag', jsonSchemaValidator, function(req,res) {

  var data = {
    tagId: req.body.tagId,
    name: req.body.name,
    receiptId: req.body.receiptId
  };

  logging.info("Updating Tag resource", data);

  tagDb.update( data ).then(function( tag ) {
    if( tag ) {
      res.send( tag );
    } else {
      res.status(404).send({
        msg: "Tag resource not found, with tagId " + data.tagId
      });
    }
  }).fail(function(error) {
    var msg = "Error while updating existing tag";
    logging.error( msg, error );
    res.status(500).send({
      msg: msg
    });
  });

});

router.post('/tag', jsonSchemaValidator, function(req,res) {

  var data = {
    name: req.body.name,
    receiptId: req.body.receiptId
  };

  tagDb.save( data ).then(function( tag ) {
    res.send( tag );
  }).fail(function(error) {
    var msg = "Error while finding saving a new tag";
    logging.error("Error while creating tag resource",error);

    res.status(500);

    res.send({
      msg: msg
    });
  });

});

module.exports = router;
