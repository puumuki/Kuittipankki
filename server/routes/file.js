
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
var settings = require('../settings');

var receiptDb  = require('../db/receipt.db');
var fileDb = require('../db/file.db');


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

  receiptDb.find( receiptId ).then((receipt) => {

    if(!receipt) {
      logging.info('Receipt '+receiptId+' not found');
      deferred.reject({ status: 404, msg: "Receipt resource "+ receiptId +" not found"});
    }
    //Check that receipt is user receipt
    else if( receipt.user_id === req.user.user_id ) {
      deferred.resolve(receipt);
    } else {
      logging.warn('Error on uploading picture to server, receipt is not currently logged user receipt.');
      deferred.reject({ status: 401, msg: "Not authorized, you have no access to upload image to this receipt"});
    }


  }).fail(function( error ) {
    logging.error("Error occurred while validating receipt information", error );
    deferred.reject({ status: 500, msg: "Internal error occurred"});
  });

  return deferred.promise;
}

/*
 * Upload images and files to Kuittipankki server
 * @method POST
 * @route upload
 */
 try {


router.post('/upload', authentication.isAuthorized, multipart(), function(req, res) {

  logging.info("Starting uploading file");

  var receiptID = req.headers.receiptid;

  if( !receiptID ) {
    return res.status(400).send(JSON.stringify( {message:"Attribute receiptID is missing"} ));
  }

  if( _.keys( req.files ).length === 0 ) {
    return res.status(400).send(JSON.stringify( {message:"Request don't contain any file"} ));
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
        logging.info('Error reading file information read error');
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

      logging.info("SAVED");

      //After file is uploaded succesfully this is called with all
      deferred.then(function(fileInformation) {

        fileService.storeFileInformation( _.extend(fileInformation, req.files.file ) ).then(function() {
          logging.info("Saved file information from ", req.files.file, " to database succesfully.");
        }).fail(function(error) {
          logging.error(error);
          logging.error("Error while saving file information from ");
        });
      });

      logging.info('Saving files', req.files.file.path );
      res.status(204).end();

    }).fail(function(errorObject) {
      res.status(errorObject.status).send({message: errorObject.message}).end();
    });
  });

});

} catch( error ) {
  console.log( error );
}

/* DELETE - delete file  */
router.delete('/file/:fileId', authentication.isAuthorized, function(req, res) {

  var fileId = req.params.fileId;

  fileDb.find( fileId ).then(function( file ) {

    if( file.user_id !== req.user.user_id ) {
      res.status(403);
      res.send({message:'Unauthorized access, file you are trying to delete is not yours.'});
    } else {
      if( file ) {

        logging.log('Deleting file', file.filename);

        fileDb.delete( file.fileId ).then(function(_file) {
          fileService.deletePicture( _file );
          res.send(_file);
        }).catch(function(error) {
          logging.error("Error occurred while deleting File resouce from the db", error);
          res.status(500).send({msg: "Internal error occurred"});
        });

      } else {
        res.status(404);
        res.send({message:'Picture not found'});
      }
    }
  }).catch(function( error ) {
    if( error ) {
      logging.error('Error occurred while fetching receipt for deleting file', error );
    }

    res.status(500).send({msg: "Internal error occurred"});
  });

});

module.exports = router;
