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
var Q = require('q');
var easyimg = require('easyimage');
var fileMetaDataStorage = require('./storage-service').fileMetaDataStorage;
var timeService = require('./time-service');
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

function readFileInformation( image ) {
  return easyimg.info(path.join(UPLOAD_DIRECTORY, image));
}

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
 * Store file information to file meta data storage
 * @param {object} fileInformation
 * @return {string} fileMetaDataId
 */
function storeFileInformation( fileInformation ) {

  var fileInformationData = {
    originalFilename: fileInformation.originalFilename,
    size: fileInformation.size,
    filename: fileInformation.fileName,
    mime: fileInformation.type,
    receiptId: fileInformation.receiptId,
    width: fileInformation.width,
    height: fileInformation.height,
    depth:  fileInformation.depth,
    density: fileInformation.density,
    created: timeService.currentDateTime()
  };

  return fileMetaDataStorage.saveSync(fileInformation.fileName, fileInformationData);
}

/**
 * Return file information data if the data is available.
 * @param {string} fileName
 * @return {*} file information object or null if information is not available
 */
function getFileInformation( fileName ) {
  var data = fileMetaDataStorage.getSync( fileName );
  return data.message !== 'could not load data' ? data : null;
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

  var fileMetaInformation = fileMetaDataStorage.allSync();

  var images = _.map( files, function(filename) {

    var mimetype = mime.lookup(filename);
    var informationData = fileMetaInformation[filename] || {};
    var stats = fs.statSync(path.join(UPLOAD_DIRECTORY, filename));

    return _.extend( informationData, {
      filename: filename,
      thumbnail: getFileTypeThumbnail(mimetype, filename),
      mimetype: mimetype,
      created: stats.ctime,
      size: stats.size
    });
  });

  images.sort(function(a, b) {
    return timeService.compareDateTimes(a.created, b.created);
  });

  return images;
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
  var thumbnailPath = path.join( UPLOAD_DIRECTORY, picture.thumbnail);

  try {
    fs.accessSync(picturePath, fs.F_OK);
    logging.info('Deleting picture', picturePath);
    fs.unlinkSync(picturePath);
  } catch( error ) {
    logging.info('Could\'t delete picture', picturePath, error);
  }

  if( picture.mimetype in SUPPORTED_IMAGE_TYPES ) {
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
  loadFiles: loadFiles,
  filterFilesByReceiptID: filterFilesByReceiptID,
  deletePicture: deletePicture,
  filterPicturesByFilename:filterPicturesByFilename,
  getFileTypeThumbnail:getFileTypeThumbnail,
  storeFileInformation:storeFileInformation,
  getFileInformation:getFileInformation,
  readFileInformation:readFileInformation,
  THUMBNAIL_BY_TYPE:THUMBNAIL_BY_TYPE,
  SUPPORTED_IMAGE_TYPES:SUPPORTED_IMAGE_TYPES,
  SUPPORTED_FILE_TYPES:SUPPORTED_FILE_TYPES,
  SUPPORTED_OTHER_FILE_TYPES:SUPPORTED_OTHER_FILE_TYPES
};
