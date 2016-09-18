
var shortid = require('shortid');
var express = require('express');
var router = express.Router();
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

var multipart = require('connect-multiparty');
var Q = require('q');
var authentication = require('./../authentication');
var logging = require('../logging');
var fileService = require('../file-service');
var storage = require('../storage-service').receiptStorage;
var settings = require('../settings');

const UPLOAD_DIRECTORY = settings.upload_directory;

/**
 * Validate that receipt with a given id exist and it's owned by user
 * that is trying to modify it.
 * @param {object} req, request object
 * @param {string} receiptId, receipt identification string
 * @return {Promise} rejected if error occurs, resolved and receipt object returned if all is ok
 */
function validateReceiptInfo( req, receiptId ) {
  var deferred = Q.defer();

  storage.get(receiptId, function(err, receipt) {
    if(err || !receipt) {
      logging.log('Could not found receipt', receiptId);
      deferred.reject(err);
    }

    //Check that receipt is user receipt
    if( receipt.user_id === req.user.id ) {
      deferred.resolve(receipt);
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

  function generateFilePath(receiptId, fileEnding) {

    var generatedName = shortid.generate();
    var filename = receiptId +'.'+ generatedName +'.'+fileEnding;

    return {
      filePath: path.join( UPLOAD_DIRECTORY, filename ),
      fileName: filename,
      receiptId: receiptId
    };
  }

  function uploadImageFile(data, receiptID, contentType) {

    var deferred = Q.defer();

    var fileInformation = generateFilePath( receiptID, fileService.SUPPORTED_IMAGE_TYPES[contentType] );

    //Accually save file from temponary upload directory to the disk
    fs.writeFile(fileInformation.filePath, data, function (err) {

      //After file is copied, we creata a smaller version from the uploaded image
      //that is called a thumbnail
      fileService.createThumbnail( fileInformation.fileName ).then(function(image) {
        logging.info('Created a thumbnail for a ', image );
      })
      .fail(function(error) {
        logging.info('Error on creating thumbnail:',error);
      });

      fileService.readFileInformation( fileInformation.fileName ).then( function(fileInfo)  {

        fileInformation.width = fileInfo.width;
        fileInformation.height = fileInfo.height;
        fileInformation.depth = fileInfo.depth;
        fileInformation.density = fileInfo.density;

        deferred.resolve(fileInformation);
      }).fail(function( fileInformationReadError ) {
        console.log('Error reading file information read error');
        deferred.reject(fileInformationReadError);
      });

      if( err ) {
        logging.info('Error copying image from themponary location to permanent storage', err);
        deferred.reject(err);
      }
    });

    return deferred.promise;
  }

  function uploadFile( data, receiptID, contentType ) {

    var deferred = Q.defer();

    var fileInformation = generateFilePath( receiptID, fileService.SUPPORTED_OTHER_FILE_TYPES[contentType] );

    //Accually save file from temponary upload directory to the disk
    fs.writeFile(fileInformation.filePath, data, function (err) {
      if( err ) {
        deferred.reject(err);
        logging.info('Error copying image from themponary location to permanent storage', err);
      } else {
        deferred.resolve(fileInformation);
      }
    });

    return deferred.promise;
  }

  var receiptID = req.headers['receipt-id'];

  fs.readFile(req.files.file.path, function (err, data) {

    var promise = validateReceiptInfo(req, receiptID);

    promise.then(function(receipt) {

      var contentType = req.files.file.headers['content-type'];

      var deferred = Q.defer().promise;

      if( contentType in fileService.SUPPORTED_IMAGE_TYPES && receiptID ) {
        deferred = uploadImageFile(data, receiptID, contentType);
      } else if( contentType in fileService.SUPPORTED_OTHER_FILE_TYPES ) {
        deferred = uploadFile(data, receiptID, contentType );
      }
      else {
        logging.info('File type is not supported skipping the file');
      }

      //After file is uploaded succesfully this is called with all
      deferred.then(function(fileInformation) {
        fileService.storeFileInformation( _.extend(fileInformation, req.files.file ) );
      });

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

  //TODO: validate file name correctly
  if( !pictureName || pictureName === 'undefined'  ) {
    return res.status(400).send({message:'Parameter picture missing'});
  }

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
        logging.log('Deleting picture', picture.filename);
        fileService.deletePicture(picture);
        res.send({message:'Picture deleted '+picture.filename});
      } else {
        res.status(404);
        res.send({message:'Picture not found'});
      }
    }
  });
});

module.exports = router;
