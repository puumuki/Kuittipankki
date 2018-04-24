define(function(require){

  var _ = require('underscore');
  var Backbone = require('backbone');
  var TagCollection = require('collections/tag-collection');
  var FileCollection = require('collections/file-collection');

  var Receipt = Backbone.Model.extend({

    idAttribute: "receiptId",

    defaults: {
      tags: new TagCollection(),
      files: new FileCollection()
    },

    url: function() {
      return this.get('receiptId') ? '/receipt/' + this.get('receiptId') : '/receipt';
    },

    removePicture: function(fileModel) {
      this.get('files').remove( fileModel, {
        success: _.bind(function() {
          this.trigger('change');
        }, this)
      });

    },

    findFile: function(fileName) {
      return this.get('files').find(function(file) {
        return file.get('filename') === fileName;
      });
    },

    parse: function( data ) {
      Receipt.__super__.parse.call(this, data);
      data.tags = new TagCollection(data.tags);
      data.files = new FileCollection(data.files);
      return data;
    },

    toJSON: function() {

      var tags = this.get('tags');
      var files = this.get('files');

      return _.extend( Receipt.__super__.toJSON.call(this),{
        tags: tags ? tags.toJSON() : [],
        files: files ? files.toJSON() : []
      });
    }

  });

  return Receipt;
});
