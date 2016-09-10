/**
 * Picture service module contains file operations required to store, delete and list
 * pictures at the disk.
 */
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var logging = require('./logging');
var settings = require('./settings');
var mime = require('mime-types');
var util = require('util');

const UPLOAD_DIRECTORY = settings.upload_directory;

/**
 * Configure here witch kind thumbnail is used to different type media types.
 */
const THUMBNAIL_BY_TYPE = {
  '_default':'thumbnail.default.svg',
  'image/*': 'thumbnail.%s',
  'application/pdf': 'thumbnail.pdf.svg',
  'application/txt': 'thumbnail.txt.svg',
  'text/plain': 'thumbnail.txt.svg'
};

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
 * Return right thumbnail based on file mimetype
 * @param {string} mimetype, application/txt or image/pdf or something that sort
 * @param {string} filename, optional can be used if it's required to attached to filename
 * @return {string} thumbnail file name or undefined if no a thumbnail was not found
 */
function getFileTypeThumbnail( mimetype, filename ) {

  //Default thumbnail
  var thumbnail = THUMBNAIL_BY_TYPE._default;

  if( !mimetype || !filename ) {
    return thumbnail;
  }

  var parts = mimetype.split('/');

  var toplevel = parts[0];
  var subtype = parts[1];

  //First search specific configuration
  if( THUMBNAIL_BY_TYPE[mimetype] ) {
    thumbnail = THUMBNAIL_BY_TYPE[mimetype];

  //Secondery option is to use top level thumbnail
  } else if( THUMBNAIL_BY_TYPE[toplevel+'/*'] ) {
    thumbnail = THUMBNAIL_BY_TYPE[toplevel+'/*'];  
  }

  return util.format( thumbnail, filename ).split(' ')[0];
}

/**
 * Load pictures all pictures
 * @return array of objects containing all pictures in pictures directory
 */
function loadFiles() {

  var files = fs.readdirSync(UPLOAD_DIRECTORY);

  files = _.filter(files, function(file) {
    var parts = file.split('.');
    var fileType = _.last(parts);
    return _.indexOf( SUPPORTED_FILE_TYPES, fileType ) >= 0;
  });

  return _.map( files, function(filename) {

    var mimetype = mime.lookup(filename);

    return {
      filename: filename,
      thumbnail: getFileTypeThumbnail(mimetype, filename),
      mimetype: mimetype,
      size: fs.statSync(path.join(UPLOAD_DIRECTORY, filename)).size
    };
  });
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

  logging.info("Deleting thumbnail and picture", picture);

  var picturePath = path.join( UPLOAD_DIRECTORY, picture.filename);
  var thumbnailPath = path.join( UPLOAD_DIRECTORY, picture.thumbnail);
     
  try {
    fs.accessSync(picturePath, fs.F_OK);
    logging.info('Deleting picture', picturePath);
    fs.unlinkSync(picturePath);  
  } catch( error ) {
    logging.info('Could\'t delete picture', picturePath, error);
  }
 
  try {
    fs.accessSync(thumbnailPath, fs.F_OK)
    logging.info('Deleting thumbnail', thumbnailPath);
    fs.unlinkSync(thumbnailPath);  
  } catch( error ) {
    logging.info('Could\'t delete thumbnail', thumbnailPath);
  }
}

module.exports = {
  loadFiles: loadFiles,
  filterFilesByReceiptID: filterFilesByReceiptID, 
  deletePicture: deletePicture,
  filterPicturesByFilename:filterPicturesByFilename,
  getFileTypeThumbnail:getFileTypeThumbnail,
  THUMBNAIL_BY_TYPE:THUMBNAIL_BY_TYPE,
  SUPPORTED_IMAGE_TYPES:SUPPORTED_IMAGE_TYPES,
  SUPPORTED_FILE_TYPES:SUPPORTED_FILE_TYPES,
  SUPPORTED_OTHER_FILE_TYPES:SUPPORTED_OTHER_FILE_TYPES
};