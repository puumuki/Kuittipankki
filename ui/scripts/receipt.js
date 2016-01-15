define(function(require){

  var Backbone = require('backbone');

  var Receipt = Backbone.Model.extend({
    url: function() {
      return this.get("id") ? "/receipt/" + this.get("id") : "/receipt";
    },

    removePicture: function(pictureModel) {
      var pictures = _.filter( this.get('pictures'), function(pic) {
        return pic.filename !== pictureModel;
      });

      this.set('pictures', pictures);
    }
  });

  return Receipt;
});