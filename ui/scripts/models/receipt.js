define(function(require){

  var _ = require('underscore');
  var Backbone = require('backbone');
  var TagCollection = require('collections/tag-collection');


  var Receipt = Backbone.Model.extend({

    idAttribute: "receiptId",

    defaults: {
      tags: new TagCollection()
      //files: new FileCollection();
    },

    url: function() {
      return this.get('receiptId') ? '/receipt/' + this.get('receiptId') : '/receipt';
    },

    removePicture: function(fileModel) {
      var files = _.filter( this.get('files'), function(pic) {
        return pic.filename !== fileModel.filename;
      });

      this.set('files', files);
    },

    findFile: function(fileName) {
      return _.find( this.get('files'), function( file ) {
        return file.filename === fileName;
      });
    },

    parse: function( data ) {
      Receipt.__super__.parse.call(this, data);
      data.tags = new TagCollection(data.tags);
      return data;
    }

  });

  return Receipt;
});
