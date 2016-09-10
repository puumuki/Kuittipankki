
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
var logging = require('../logging');
var fileService = require('../file-service');
var storage = require('../storage-service').receiptStorage;
var settings = require('../settings');

const UPLOAD_DIRECTORY = settings.upload_directory;

function createThumbnail( image ) {
  
  var deferred = Q.defer();

  easyimg.thumbnail({
    src: path.join(UPLOAD_DIRECTORY, image),
    dst: path.join(UPLOAD_DIRECTORY, 'thumbnail.' + image),
    width: 200,
    heigth: 200
  }).then(
    function(file) {
      deferred.resolve(file);
    }, function (err) {
      deferred.reject(err);
    }
  );

  return deferred.promise;
}

function validateReceiptInfo( req, receiptId ) {
  var deferred = Q.defer();

  storage.get(receiptId, function(err, receipt) {
    if(err || !receipt) {
      logging.log('Could not found receipt', receiptId);
      deferred.reject(err);
    }

    //Check that receipt is user receipt
    if( receipt.user_id === req.user.id ) {
      deferred.resolve(true);
    }
  });

  return deferred.promise;
}

/*
 * Upload images and files to Kuittipankki server 
 * @method POST
 * @route upload 
 */
router.post('/upload', authentication.isAuthorized, multipart(), function(req, res) {

  if( !req.user ) {
    logging.error('Unauthorized access, trying upload picture');
    return res.status(403).send({message:'Unauthorized'});
  }

  function generateFilePath(receiptID, fileEnding) {
    
    var generatedName = shortid.generate();
    var filename = receiptID +'.'+ generatedName +'.'+fileEnding;
    
    return {
      filePath: path.join( UPLOAD_DIRECTORY, filename ),
      fileName: filename
    }; 
  }

  function uploadImageFile(data, receiptID, contentType) {

    var fileInformation = generateFilePath( receiptID, fileService.SUPPORTED_IMAGE_TYPES[contentType] );

    //Accually save file from temponary upload directory to the disk
    fs.writeFile(fileInformation.filePath, data, function (err) {

      //After file is copied, we creata a smaller version from the uploaded image 
      //that is called a thumbnail
      createThumbnail( fileInformation.fileName ).then(function(image) {
        logging.info('Created a thumbnail for a ', image );
      })
      .fail(function(error) {
        logging.info('Error on creating thumbnail:',error);
      });

      if( err ) {
        logging.info('Error copying image from themponary location to permanent storage', err);  
      }     
    });
  }

  function uploadFile( data, receiptID, contentType ) {

    var fileInformation = generateFilePath( receiptID, fileService.SUPPORTED_OTHER_FILE_TYPES[contentType] );

    //Accually save file from temponary upload directory to the disk
    fs.writeFile(fileInformation.filePath, data, function (err) {
      if( err ) {
        logging.info('Error copying image from themponary location to permanent storage', err);  
      }     
    }); 

  }

  var receiptID = req.headers['receipt-id'];

  fs.readFile(req.files.file.path, function (err, data) {

    var promise = validateReceiptInfo(req, receiptID);

    promise.then(function() {

      var contentType = req.files.file.headers['content-type'];

      if( contentType in fileService.SUPPORTED_IMAGE_TYPES && receiptID ) {
        uploadImageFile(data, receiptID, contentType);
      } else if( contentType in fileService.SUPPORTED_OTHER_FILE_TYPES ) {
        uploadFile(data, receiptID, contentType );
      }
      else {
        logging.info('File type is not supported skipping the file');
      }
      
      logging.info('Saving files', req.files.file.path );
    }).fail(function(error) {
      logging.error('Error on uploading picture to server, receipt is not currently logged user receipt.', error);
    });
  });

  res.status(204).end();
});

/* GET - Return all pictures */

/* DELETE - Delete picture  */
router.delete('/picture/:picture', function(req, res) {

  if( !req.user ) {
    logging.error('Unauthorized access, trying to delete picture');
    return res.status(403).send({message:'Unauthorized'});
  }

  var pictureName = req.params.picture;
  var pictures = fileService.loadFiles();
  var picture = fileService.filterPicturesByFilename(pictureName, pictures);
  var receiptId = _.first( pictureName.split('.') );

  storage.get(receiptId, function(err, receipt) {

    if( err ) {
      logging.error('Error on loading receipe', err );  
    }  

    if( receipt.user_id !== req.user.id ) {
      res.status(403);
      res.send({message:'Unauthorized access'});
    } else {
      if( picture ) {
        logging.log('Deleting picture', picture);
        fileService.deletePicture(picture);
        res.send({message:'Picture deleted'});
      } else {
        res.status(404);
        res.send({message:'Picture not found'});  
      }        
    }
  });
});

module.exports = router;