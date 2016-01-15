
define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!tmpl/confirmation-dialog');
  var _ = require('underscore');

  var regionManager = require('region-manager');

  var ConfirmationDialogView = Backbone.Marionette.ItemView.extend({

    template: template,

    initialize: function() {
      regionManager.getRegion('dialog').show(this);
    },

    events : {
      'click button[name="ok"]': '_onOkButtonClick'
    },

    _onOkButtonClick : function() {
      if( _.isFunction( this.options.onOk ) ) {
        this.options.onOk();
      }
    },

    serializeData: function() {
      return {
        title: this.options.title,
        text: this.options.text
      }
    },

    render: function() {
      ConfirmationDialogView.__super__.render.call(this);
      this.$el.find('.modal').modal();
    }

  });

  return ConfirmationDialogView;
});