
define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!image-dialog-view/image-dialog');
  var _ = require('underscore');
  var regionManager = require('region-manager');
  var pictureService = require('services/picture-service'); 
  var ConfirmationDialogView = require('confirmation-dialog-view/confirmation-dialog-view');

  var ImageDialogView = Backbone.Marionette.ItemView.extend({

    template: template,

    initialize: function() {
      regionManager.getRegion('dialog').show(this);
    },

    events : {
      'click button[name="ok"]': '_onOkButtonClick',
      'click button[name="delete"]' : '_onDeletePictureClick'
    },

    _onDeletingFail: function(error) {
      console.error('Error on deleting picture', error);
    },

    _onDeletePictureClick: function(event) {
      event.preventDefault();
      new ConfirmationDialogView({
        title: 'Kuvan poisto',
        text: 'Haluato varmasti poistaa kuvan?',
        onOk: _.bind( this._deletePicture, this )
      });
    },

    _deletePicture: function(event) {
      pictureService.deletePicture(this.options.image)
      .then(_.bind(this._onDeletedPicture, this))
      .fail(_.bind(this._onDeletingFail, this));
    },

    _onDeletedPicture: function(response) {
      //Remove picture from Receipt object
      this.options.receipt.removePicture( this.options.image );
      
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