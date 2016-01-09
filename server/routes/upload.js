
var shortid = require('shortid');
var express = require('express');
var router = express.Router();
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var easyimg = require('easyimage');
var multipart = require('connect-multiparty');
var Q = require('q');


//TODO validointi, autentikointi
//https://github.com/flosse/json-file-store

const uploadDirectory = path.join(__dirname,'..','pictures')

const mimeType = {
  'image/gif':'gif',
  'image/png':'png',
  'image/jpeg':'jpg',
  'image/bmp':'bmp'
}

function createThumbnail( image ) {
  var deferred = Q.defer();

  //console.log( "src", path.join(uploadDirectory, image) );
  //console.log( "dest", path.join(uploadDirectory, "thumbnail." + image) );

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

/* POST - upload */
router.post('/upload', multipart(), function(req, res) {

  var receiptID = req.headers['receipt-id'];

  console.log("Receipt-ID",receiptID );

  fs.readFile(req.files.file.path, function (err, data) {

    var contentType = req.files.file.headers["content-type"];
    var fileEnding = mimeType[contentType];

    if( fileEnding && receiptID ) {
      var generatedName = shortid.generate();
      var filename = receiptID +'.'+ generatedName +"."+fileEnding;
      var filePath = path.join( uploadDirectory, filename );

      fs.writeFile(filePath, data, function (err) {

        createThumbnail( filename ).then(function(image) {
          console.log("SUCCESS", image );
        })
        .fail(function(error) {
          console.log("Error on creating thumbnail:",error);
        });

        if( err ) {
          console.log("Error saving file", err);  
        }
        
      });      
    } else {
      console.info("Skipping file");
    }
    
    console.info("Saving files", req.files.file.path );
  });

  res.status(204).end();
});


module.exports = router;
