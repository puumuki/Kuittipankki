
define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!tmpl/image-dialog');
  var _ = require('underscore');

  var regionManager = require('region-manager');

  var ImageDialogView = Backbone.Marionette.ItemView.extend({

    template: template,

    initialize: function() {
      regionManager.getRegion('dialog').show(this);
    },

    events : {
      'click button[name="ok"]': '_onOkButtonClick',
    },

    _onOkButtonClick : function() {
      if( _.isFunction( this.options.onOk ) ) {
        this.options.onOk();
      }
    },

    serializeData: function() {
      return {
        title: this.options.title,
        image: this.options.image
      };
    },

    render: function() {
      ImageDialogView.__super__.render.call(this);
      this.$el.find('.modal').modal();
    }
  });

  return ImageDialogView;
});