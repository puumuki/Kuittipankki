/**
 * Picture service module contains file operations required to store, delete and list
 * pictures at the disk.
 */
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var logging = require('./logging');
var settings = require('./settings');
var Q = require('q');
var easyimg = require('easyimage');
const UPLOAD_DIRECTORY = settings.upload_directory;
const fileDb = require('./db/file.db');
const receiptDb = require('./db/receipt.db');
const fileUtils = require('./file-utils');

const SUPPORTED_IMAGE_TYPES = {
  'image/gif':'gif',
  'image/png':'png',
  'image/jpeg':'jpg',
  'image/bmp':'bmp'
};

const SUPPORTED_OTHER_FILE_TYPES = {
  'application/pdf':'pdf',
  'application/txt':'txt',
  'text/plain':'txt'
};

const SUPPORTED_FILE_TYPES = ['bmp','png','jpg','gif','pdf','txt'];

/**
 * Create a thumbnail from a image
 * @param {string} image, image path
 * @return {Promise} resolved with a thumbnail image file, rejected with a error object
 */
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

/**
 * Read file information from the file stored to upload directory
 *
 * @async
 * @return {Promise} Promise is resolved with file information object
 */
function readFileInformation( image ) {
  return easyimg.info(path.join(UPLOAD_DIRECTORY, image));
}

/**
 * Store file information to file meta data storage
 * @param {object} fileInformation
 * @return {Q.Promise} promise
 */
function storeFileInformation( fileInformation ) {

  var fileInformationData = {
    originalFilename: fileInformation.originalFilename,
    size: fileInformation.size,
    filename: fileInformation.fileName,
    mimetype: fileInformation.type,

    receiptId: fileInformation.receiptId,

    width: fileInformation.width,
    height: fileInformation.height,
    depth:  fileInformation.depth,

    thumbnail: 'thumbnail.' + fileInformation.fileName
  };

  if( fileInformation.density ) {
    fileInformationData.densityY = fileInformation.density.y;
    fileInformationData.densityX = fileInformation.density.x;
  }

  var defer = Q.defer();

  receiptDb.find( fileInformation.receiptId ).then(function(receipt) {

    fileInformationData.userId = receipt.userId;

    fileDb.save( fileInformationData ).then(defer.resolve)
                                      .fail(defer.reject);

  }).fail(defer.reject );

  return defer.promise;
}

/**
 * Picture's filename has a receipt ID included, by that
 * information receipts are filtered from file array
 * @param {string} receiptID
 * @param {array of objects} pictures
 * @return {array of objects} return pictures that has receiptID in filename
 */
function filterFilesByReceiptID(id, pictures) {
  return _.filter(pictures, function(file) {
    var parts = file.filename.split('.');
    return _.first(parts) === id;
  });
}

/**
 * Filters pictures by the filename
 * @param {string} filename
 * @param {array of objects} pictures
 * @return {object} picture object is one is found, it not returns undefined
 */
function filterPicturesByFilename(filename, pictures) {
  var results = _.filter(pictures, function(file) {
    return file.filename === filename;
  });

  return _.first(results);
}



/**
 * Deletes picture from the disk, deletion is a syncronous operation.
 * @param {object} picture object
 */
function deletePicture(picture) {

  logging.info('Deleting thumbnail and picture', picture);

  var picturePath = path.join( UPLOAD_DIRECTORY, picture.filename);

  try {
    fs.accessSync(picturePath, fs.F_OK);
    logging.info('Deleting picture', picturePath);
    fs.unlinkSync(picturePath);
  } catch( error ) {
    logging.info('Could\'t delete picture', picturePath, error);
  }

  if( picture.mimetype in SUPPORTED_IMAGE_TYPES && picture.thumbnail) {

    var thumbnailPath = path.join( UPLOAD_DIRECTORY, picture.thumbnail);

    try {
      fs.accessSync(thumbnailPath, fs.F_OK);
      logging.info('Deleting thumbnail', thumbnailPath);
      fs.unlinkSync(thumbnailPath);
    } catch( error ) {
      logging.info('Could\'t delete thumbnail', thumbnailPath);
    }
  }
}

module.exports = {
  createThumbnail:createThumbnail,
  filterFilesByReceiptID: filterFilesByReceiptID,
  deletePicture: deletePicture,
  filterPicturesByFilename:filterPicturesByFilename,
  getFileTypeThumbnail: fileUtils.getFileTypeThumbnail,
  storeFileInformation:storeFileInformation,
  readFileInformation:readFileInformation,
  SUPPORTED_IMAGE_TYPES:SUPPORTED_IMAGE_TYPES,
  SUPPORTED_FILE_TYPES:SUPPORTED_FILE_TYPES,
  SUPPORTED_OTHER_FILE_TYPES:SUPPORTED_OTHER_FILE_TYPES
};
