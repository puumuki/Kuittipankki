/**
 * Picture service module contains file operations required to store, delete and list
 * pictures at the disk.
 */
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var logging = require('./logging');

/**
 * Load pictures all pictures
 * @return array of objects containing all pictures in pictures directory
 */
function loadPictures() {

  //Supported file formats
  const fileTypes = ['bmp','png','jpg'];

  var files = fs.readdirSync(path.join(__dirname,'pictures'));

  files = _.filter(files, function(file) {
    var parts = file.split('.');
    var fileType = _.last(parts);
    return _.indexOf( fileTypes, fileType ) >= 0;
  });

  return _.map( files, function(filename) {
    return {
      filename: filename,
      thumbnail: 'thumbnail.' + filename,
      size: fs.statSync(path.join(__dirname,'pictures', filename)).size
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
function filterPicturesByReceiptID(id, pictures) {
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
 * @return undefined
 */
function deletePicture(picture) {
  var picturePath = path.join(__dirname,'pictures', picture.filename);
  logging.log('Deleting picture', picturePath);
  fs.unlinkSync(picturePath);
  
  var thumbnailPath = path.join(__dirname,'pictures', picture.thumbnail);
  logging.log('Deleting thumbnail', thumbnailPath);
  fs.unlinkSync(thumbnailPath);
}

module.exports = {
  loadPictures: loadPictures,
  filterPicturesByReceiptID: filterPicturesByReceiptID, 
  deletePicture: deletePicture,
  filterPicturesByFilename:filterPicturesByFilename
};