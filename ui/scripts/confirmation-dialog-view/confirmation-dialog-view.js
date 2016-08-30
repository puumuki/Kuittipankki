
define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!confirmation-dialog-view/confirmation-dialog');
  var _ = require('underscore');

  var regionManager = require('region-manager');

  var ConfirmationDialogView = Backbone.Marionette.ItemView.extend({

    template: template,

    initialize: function() {
      regionManager.getRegion('dialog').show(this);
    },

    events : {
      'click button[name="ok"]': '_onOkButtonClick',
      'click button[name="cancel"]': '_onCancelButtonClick'
    },

    _onOkButtonClick : function() {
      if( _.isFunction( this.options.onOk ) ) {
        this.options.onOk();
      }
    },

    _onCancelButtonClick: function() {
      //Close modal
      this.$el.find('.modal').modal('hide');
      
      //Bootstrap won't support multiple open modals, 
      //at this point we had open this and ConfirmationDialogView,
      //so it counts as multiple dialogs. This is how we just clean up
      //the modal backdrop.
      $('.modal-backdrop').remove();
    },

    serializeData: function() {
      return {
        title: this.options.title,
        text: this.options.text
      };
    },

    render: function() {
      ConfirmationDialogView.__super__.render.call(this);
      this.$el.find('.modal').modal();
    }

  });

  return ConfirmationDialogView;
});