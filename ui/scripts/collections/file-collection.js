define(function(require) {
  var Backbone = require('backbone');
  var File = require('models/file');

  var FileCollection = Backbone.Collection.extend({
      url: '/files',
      model: File
  });

  return FileCollection;
});
