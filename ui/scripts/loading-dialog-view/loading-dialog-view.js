
define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!loading-dialog-view/loading-dialog');
  var _ = require('underscore');
  var regionManager = require('region-manager');

  var LoadingDialogView = Backbone.Marionette.ItemView.extend({

    template: template,

    events : {
      'click button[name="close"]' : 'hideDialog'
    },

    initialize: function( options ) {
      this.setTitle( options && options.title || 'Lataa...' );
    },

    setTitle: function(title) {
      this._title = title;
    },

    setMessage: function(message) {
      this._message = message;
    },

    _onCancelClick: function(event) {
      event.preventDefault();
    },

    hideDialog: function() {
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
        'title': this._title || 'Lataa...',
        'message': this._message
      };
    },

    render: function() {
      LoadingDialogView.__super__.render.call(this);
      this.$el.find('.modal').modal();
    }
  },

  //Static methods
  {
    hide: function() {
      if( this._instance ) {
        this._instance.hideDialog();
      }
    },

    showErrorMessage: function(title, message) {
      if( !this._instance ) {
        this._instance = new LoadingDialogView();
      }

      this._instance.setTitle( title );
      this._instance.setMessage( message );

      regionManager.getRegion('loadingdialog').show(this._instance);
    },

    show: function(title) {
      if( !this._instance ) {
        this._instance = new LoadingDialogView();
      }

      this._instance.setTitle( title );

      regionManager.getRegion('loadingdialog').show(this._instance);
    }
  });

  return LoadingDialogView;
});
