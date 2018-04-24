
define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!file-dialog-view/file-dialog');
  var _ = require('underscore');
  var regionManager = require('region-manager');
  var fileService = require('services/file-service');
  var ConfirmationDialogView = require('confirmation-dialog-view/confirmation-dialog-view');

  var FileDialogView = Backbone.Marionette.ItemView.extend({

    template: template,

    initialize: function() {
      regionManager.getRegion('dialog').show(this);
    },

    events : {
      'click button[name="open"]' : '_onOpenFileClick',
      'click button[name="delete"]' : '_onDeleteFileClick'
    },

    _onDeletingFail: function(error) {
      console.error('Error on deleting file', error);

      //Close modal
      this.$el.find('.modal').modal('hide');
      $('.modal-backdrop').remove();
    },

    _onOpenFileClick: function() {
        window.open( 'files/' + this.options.file.get('filename') );
        this._closeDialog();
    },

    _onDeleteFileClick: function(event) {
      event.preventDefault();
      new ConfirmationDialogView({
        title: 'Kuvan poisto',
        text: 'Haluato varmasti poistaa tiedoston?',
        onOk: _.bind( this._deleteFile, this )
      });
    },

    _deleteFile: function(event) {
      fileService.deletePicture(this.options.file.get('fileId') )
      .then(_.bind(this._onDeletedFile, this))
      .fail(_.bind(this._onDeletingFail, this));
    },

    _onDeletedFile: function(response) {
      //Remove picture from Receipt object
      this.options.receipt.removePicture( this.options.file );
      this.options.receipt.trigger('change');
      this._closeDialog();
    },

    _closeDialog: function() {
      //Close modal
      this.$el.find('.modal').modal('hide');

      //Bootstrap won't support multiple open modals,
      //at this point we had open this and ConfirmationDialogView,
      //so it counts as multiple dialogs. This is how we just clean up
      //the modal backdrop.
      $('.modal-backdrop').remove();
    },

    _onOkButtonClick : function() {
      if( _.isFunction( this.options.onOk ) ) {
        this.options.onOk();
      }
    },

    serializeData: function() {
      return _.extend(this.options.file.toJSON(),{
        title: this.options.title + ' ' + this.options.file.get('filename')
      });
    },

    render: function() {
      FileDialogView.__super__.render.call(this);
      this.$el.find('.modal').modal();
    }
  });

  return FileDialogView;
});
