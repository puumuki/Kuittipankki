define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!tmpl/picture')

  var PictureView = Backbone.Marionette.ItemView.extend({

    template: template,

    serializeData: function() {
      return _.extend(this.options.receipt.toJSON(), {
        img: this.options.image
      } );
    },

    render: function() {
      PictureView.__super__.render.apply(this, arguments);
      return this;
    }

  });

  return PictureView;
});