var _ = require("underscore");
var s = require("underscore.string");

function camelizeObject( object ) {

  _.each( _.keys( object ), function( key ) {

    let camilizedKey = s.camelize( key );

    if( key !== camilizedKey ) {
      object[ camilizedKey ] = object[ key ];
      delete object[key];
    }

  });

  return object;
}

function underscoreObject( object ) {
  _.each( _.keys( object ), function( key ) {

    let underscoredKey = s.underscored( key );

    if( key !== underscoredKey ) {
      object[ underscoredKey ] = object[ key ];
      delete object[key];
    }
  });

  return object;
}

module.exports = {
  camelizeObject: camelizeObject,
  underscoreObject:underscoreObject
};
