
var shortid = require('shortid');
var express = require('express');
var router = express.Router();
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var easyimg = require('easyimage');
var multipart = require('connect-multiparty');
var Q = require('q');
var authentication = require('./../authentication');
var Store = require("jfs");
var logging = require('../logging');
var pictureService = require('../picture-service');
var storage = new Store('data/receipts.json', {saveId:true});

const uploadDirectory = path.join(__dirname,'..','pictures')

const mimeType = {
  'image/gif':'gif',
  'image/png':'png',
  'image/jpeg':'jpg',
  'image/bmp':'bmp'
}

function createThumbnail( image ) {
  
  var deferred = Q.defer();

  easyimg.thumbnail({
    src: path.join(uploadDirectory, image),
    dst: path.join(uploadDirectory, "thumbnail." + image),
    width: 200,
    heigth: 200
  }).then(
    function(file) {
      defer.resolve(file);
    }, function (err) {
      defer.reject(err);
    }
  );

  return deferred.promise;
}

function validateReceiptInfo( req, receiptId ) {
  var deferred = Q.defer();

  storage.get(receiptId, function(err, receipt) {
    if(err || !receipt) {
      logging.log("Could not found receipt", receiptId);
      deferred.reject(err);
    }

    //Check that receipt is user receipt
    if( receipt.user_id === req.user.id ) {
      deferred.resolve(true);
    }
  });

  return deferred.promise;
}

/* POST - upload */
router.post('/upload', authentication.isAuthorized, multipart(), function(req, res) {

  if( !req.user ) {
    logging.error("Unauthorized access, trying upload picture");
    return res.status(403).send({message:'Unauthorized'});
  }

  var receiptID = req.headers['receipt-id'];

  fs.readFile(req.files.file.path, function (err, data) {

    var promise = validateReceiptInfo(req, receiptID);

    promise.then(function() {

      var contentType = req.files.file.headers["content-type"];
      var fileEnding = mimeType[contentType];

      if( fileEnding && receiptID ) {
        var generatedName = shortid.generate();
        var filename = receiptID +'.'+ generatedName +"."+fileEnding;
        var filePath = path.join( uploadDirectory, filename );

        fs.writeFile(filePath, data, function (err) {

          createThumbnail( filename ).then(function(image) {
            logging.info("SUCCESS", image );
          })
          .fail(function(error) {
            logging.info("Error on creating thumbnail:",error);
          });

          if( err ) {
            logging.info("Error saving file", err);  
          }
          
        });      
      } else {
        logging.info("Skipping file");
      }
      
      logging.info("Saving files", req.files.file.path );
    }).fail(function(error) {
      logging.error("Error on uploading picture to server, receipt is not currently logged user receipt.", error);
    });
  });

  res.status(204).end();
});

/* GET - Return all pictures */

/* DELETE - Delete picture */
router.delete('/picture/:picture', function(req, res) {

  if( !req.user ) {
    logging.error("Unauthorized access, trying to delete picture");
    return res.status(403).send({message:'Unauthorized'});
  }

  var pictureName = req.params['picture'];
  var pictures = pictureService.loadPictures();
  var picture = pictureService.filterPicturesByFilename(pictureName, pictures);
  var receiptId = _.first( pictureName.split('.') );

  storage.get(receiptId, function(err, receipt) {

    if( err ) {
      logger.error("Error on loading receipe", err );  
    }  

    if( receipt.user_id !== req.user.id ) {
      res.status(403);
      res.send({message:'Unauthorized access'});
    } else {
      if( picture ) {
        logging.log("Deleting picture", picture);
        pictureService.deletePicture(picture);
        res.send({message:'Picture deleted'});
      } else {
        res.status(404);
        res.send({message:'Picture not found'});  
      }        
    }
  });
});

module.exports = router;