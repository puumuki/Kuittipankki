
var _ = require('underscore');
var fs = require('fs');
var path = require('path');

/**
 * Load pictures all pictures
 */
function loadPictures() {
  const fileTypes = ['bmp','png','jpg'];

  var files = fs.readdirSync(path.join(__dirname,'pictures'));

  files = _.filter(files, function(file) {
    var parts = file.split('.');
    var fileType = _.last(parts);
    return _.indexOf( fileTypes, fileType ) >= 0;
  })

  return _.map( files, function(filename) {
    return {
      filename: filename,
      thumbnail: 'thumbnail.' + filename,
      size: fs.statSync(path.join(__dirname,'pictures', filename)).size
    };
  });
}

function filterPicturesByReceiptID(id, files) {
  return _.filter(files, function(file) {
    var parts = file.filename.split('.');
    return _.first(parts) === id;
  });
}

function filterPicturesByFilename(filename, files) {
  var results = _.filter(files, function(file) {
    return file.filename === filename;
  });

  return _.first(results);
}

function deletePicture(picture) {
  var picturePath = path.join(__dirname,'pictures', picture.filename);
  console.log("Deleting picture", picturePath);
  fs.unlinkSync(picturePath);
  
  var thumbnailPath = path.join(__dirname,'pictures', picture.thumbnail);
  console.log("Deleting thumbnail", thumbnailPath);
  fs.unlinkSync(thumbnailPath);
}

module.exports = {
  loadPictures: loadPictures,
  filterPicturesByReceiptID: filterPicturesByReceiptID, 
  deletePicture: deletePicture,
  filterPicturesByFilename:filterPicturesByFilename
};