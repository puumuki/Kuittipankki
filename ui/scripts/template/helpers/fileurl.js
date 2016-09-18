define(function(require) {

  var Handlebars = require('handlebars');

  function fileUrlHelper( fileObject ) {

    if( fileObject.mimetype.includes('image') ) {
      return new Handlebars.SafeString('#files/'+ fileObject.filename);
    } else {
      return new Handlebars.SafeString('files/'+ fileObject.filename);
    }
  }

  Handlebars.registerHelper('fileurl', fileUrlHelper);
});
