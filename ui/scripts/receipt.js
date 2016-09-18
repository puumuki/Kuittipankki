define(function(require){

  var _ = require('underscore');
  var Backbone = require('backbone');

  var Receipt = Backbone.Model.extend({
    url: function() {
      return this.get('id') ? '/receipt/' + this.get('id') : '/receipt';
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
    }
  });

  return Receipt;
});
