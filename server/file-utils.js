const util = require('util');

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

/**
 * Return right thumbnail based on file mimetype
 * @param {string} mimetype, application/txt or image/pdf or something that sort
 * @param {string} filename, optional can be used if it's required to attached to filename
 * @return {string} thumbnail file name or undefined if no a thumbnail was not found
 */
 exports.getFileTypeThumbnail = function( mimetype, filename ) {

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
};
