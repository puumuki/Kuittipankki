define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!tmpl/picture');
  var ConfirmationDialogView = require('confirmation-dialog-view/confirmation-dialog-view');
  var fileService = require('services/file-service');
  var _ = require('underscore');

  var PictureView = Backbone.Marionette.ItemView.extend({

    template: template,

    events : {
      'click button[name="delete"]':'_onDeletePictureClick'
    },

    _onImageLoadError: function() {
      this._error = {
        message: 'Kuvaa ei valitettavasti pystytty lataamaan.'
      };
      this.render();
    },

    serializeData: function() {
      console.log( this.options.file );
      return _.extend(this.options.receipt.toJSON(), {
        img: '/files/' + this.options.file.filename,
        error: this._error,
        file: this.options.file
      });
    },

    _onDeletedPicture: function(response) {
      this.options.receipt.removePicture( this.options.image );
      App.router.navigate('/#receipt/view/' + this.options.receipt.get('id'), {trigger:true} );
    },

    _onDeletingFail: function(error) {
      console.log('Error on deleting picture', error);
    },

    _onDeletePictureClick: function() {
      new ConfirmationDialogView({
        title: 'Kuvan poisto',
        text: 'Haluato varmasti poistaa kuvan?',
        onOk: _.bind( this._deletePicture, this )
      });
    },

    _deletePicture: function(event) {
      fileService.deletePicture(this.options.image)
      .then(_.bind(this._onDeletedPicture, this))
      .fail(_.bind(this._onDeletingFail, this));
    },

    render: function() {
      PictureView.__super__.render.apply(this, arguments);
      this.$el.find('img').on('error', _.bind(this._onImageLoadError,this));
      return this;
    }
  });

  return PictureView;
});
