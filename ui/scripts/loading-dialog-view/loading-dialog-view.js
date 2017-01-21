define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!loading-dialog-view/loading-dialog');
  var regionManager = require('region-manager');
  var _ = require('underscore');

  var LoadingDialogView = Backbone.Marionette.ItemView.extend({

    template: template,

    events : {
      'click button[name="close"]' : 'closeDialog'
    },

    initialize: function( options ) {
      this.setParams( options && options.title, options && options.message );
    },

    setParams: function( title, message ) {
      this._title = title;

      if( typeof message === 'object' || _.isArray( message ) ) {
        JSON.stringify( message );
      } else {
        this._message = message;
      }
    },

    _onCancelClick: function(event) {
      event.preventDefault();
    },

    closeDialog: function() {
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
    getInstance: function() {
      if( !this._instance ) {
        this._instance = new LoadingDialogView();
      }
      return this._instance;
    },

    hide: function() {
      LoadingDialogView.getInstance().closeDialog();
    },

    showErrorMessage: function(title, message) {
      var loadingDialog = LoadingDialogView.getInstance();
      loadingDialog.setParams( title, message );
      regionManager.getRegion('loadingdialog').show(this._instance);
    },

    show: function(title) {
      var loadingDialog = LoadingDialogView.getInstance();
      loadingDialog.setParams(title);
      regionManager.getRegion('loadingdialog').show(this._instance);
    }
  });

  return LoadingDialogView;
});
