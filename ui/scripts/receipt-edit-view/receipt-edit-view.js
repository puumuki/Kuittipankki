  define(function(require) {

  var template = require('hbs!receipt-edit-view/receipt-edit');

  var Backbone = require('backbone');
  var moment = require('moment');
  var Communicator = require('communicator');

  var ConfirmationDialogView = require('confirmation-dialog-view/confirmation-dialog-view');

  var receiptService = require('services/receipt-service');
  var userService = require('services/user-service');
  var effectService = require('services/effect-service');

  var LoadingDialogView   = require('loading-dialog-view/loading-dialog-view');
  var ImageDialogView = require('image-dialog-view/image-dialog-view');
  var _ = require('underscore');

  require('bootstraptagsinput');

  function formatDate(dateString) {
    var date = moment(dateString,'DD.MM.YYYY');
    return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : '';
  }

  var ReceiptEditView = Backbone.Marionette.ItemView.extend({

    attachView: effectService.fadeIn,

    template: template,

    ui: {
      'title':'.panel-heading',
      'name':'input[name="name"]',
      'store': 'input[name="store"]',
      'warrantlyEndDate': 'input[name="warrantlyEndDate"]',
      'registered': 'input[name="registered"]',
      'purchaseDate':'input[name="purchaseDate"]',
      'tags':'input[name="tags"]',
      'pictureName': 'input[name="pictureName"]',
      'price': 'input[name="price"]',
      'picturePreview': '.picturePreview',
      'description': 'textarea[name="description"]'
    },

    events: {
      'click button[name="delete"]' : '_deleteReceiptClick',
      'keyup input[name="name"]':'_updateName',
      'click button[name="save"]':'_save',
      'click button[name="clone"]':'_cloneReceiptClick',
      'click .dz-image-preview': '_openImage'
    },

    initialize: function() {
      Communicator.mediator.on('app:user:logout',_.bind(this._onLogout, this));
    },

    _cloneReceiptClick: function() {
      new ConfirmationDialogView({
        title: 'Kuitin monistus',
        text: 'Haluato varmasti monistaa, eli kloonata, eli kopioda kuitin?',
        onOk: _.bind( this._cloneReceipt, this )
      });
    },

    _deleteReceiptClick: function() {
      new ConfirmationDialogView({
        title: 'Kuitin poisto',
        text: 'Haluato varmasti poistaa kuitin?',
        onOk: _.bind( this._deleteReceipt, this )
      });
    },

    _cloneReceipt: function() {

      LoadingDialogView.show("Monistetaan kuittia..");

      var promise = receiptService.cloneReceipt(this.model);

      promise.then(function(receipt) {
        LoadingDialogView.hide();
        App.router.navigate('#receipt/edit/'+receipt.get('id'), {trigger:true});
      }).fail(function(error) {
        LoadingDialogView.showErrorMessage( "Kohtasimme ongleman moniastessame kuittia..", JSON.stringify(error) );
        console.error(error);
        //TODO: Make error handling
      });
    },

    _deleteReceipt: function() {

      LoadingDialogView.show("Poistetaan kuittia..");

      var promise = receiptService.deleteReceipt(this.model);

      promise.then(function(data) {
        App.router.navigate('#', {trigger:true});
        LoadingDialogView.hide();
      }).fail(function(error) {
        LoadingDialogView.showErrorMessage( "Kohtasimme ongleman poistaessamme kuittia..", JSON.stringify(error) );
        console.error(error);
        //TODO: Make error handling
      });
    },

    _onLogout: function() {
      this.render();
    },

    _badgeHover: function(event) {
      $(event.currentTarget).addClass('badge-highlight');
    },

    _badgeOut: function(event) {
      $(event.currentTarget).removeClass('badge-highlight');
    },

    _updateName: function() {
      var value = this.ui.name.val();
      this.ui.title.text( value ? value : '--' );
    },

    _openImage: function(event) {
      var filename = $(event.currentTarget).find('img').attr('alt');
      new ImageDialogView({
        title: 'Kuva',
        image: filename
      });
    },

    _fileUploaded: function(response, response2) {
      if( this.model.get('id') ) {
        this.model.fetch(null, {});
      } else {
        receiptService.saveReceipt(this.model);
      }
    },

    _save: function(e) {

      LoadingDialogView.show("Tallentaa kuittia..");

      this.model.set('name', this.ui.name.val() );
      this.model.set('store', this.ui.store.val() );
      this.model.set('warrantlyEndDate', formatDate( this.ui.warrantlyEndDate.val() ));
      this.model.set('registered', formatDate( this.ui.registered.val() ));
      this.model.set('purchaseDate', formatDate( this.ui.purchaseDate.val() ));
      this.model.set('tags', this.ui.tags.val().split(',') );
      this.model.set('description', this.ui.description.val());
      this.model.set('price', this.ui.price.val());

      var promise = receiptService.saveReceipt(this.model);

      promise.then(function(receipt) {
        LoadingDialogView.hide();
        App.router.navigate('#receipt/view/'+receipt.get('id'), {trigger:true});
      }).fail(function(error) {
        LoadingDialogView.showErrorMessage( "Kohtasimme ongleman kuittia tallentaessa..", JSON.stringify(error) );
        console.log(error);
        //TODO: Implementoi virhekäsittely
      });
    },

    serializeData: function() {
      return _.extend( this.model.toJSON(), {
        tags: _.filter( this.model.get('tags'), function(tag) {
          return tag !== '';
        }).join(','),
        readonly: !userService.getAuthenticatedUser()
      });
    },

    readData: function() {
      return this.$(':input').map(function() {
        return { field: $(this).attr('name'), value : $(this).val() };
      });
    },

    _renderDropZone: function() {

      this.dropzone = new window.Dropzone(this.$('.dropzone').get(0), {
        url: '/upload',
        acceptedFiles: 'image/*, application/pdf, text/plain',
        addRemoveLinks: false,
        dictDefaultMessage: 'Raahaa kuvat ja pudota kuvat tähän, latausta varten.',
        headers: {
          'receipt-id':this.model.get('id')
        },
        init: function() {}
      });

      this.dropzone.on('success', _.bind(this._fileUploaded, this) );

      //Cancel preview click on added file, file name is not
      this.dropzone.on('addedfile', _.bind( function(file) {

        var ext = file.name.split('.').pop();

        if (ext === 'pdf') {
            this.dropzone.createThumbnailFromUrl(file, 'files/thumbnail.pdf.png');
        } else if (ext.indexOf('txt') !== -1) {
            this.dropzone.createThumbnailFromUrl(file, 'files/thumbnail.txt.png');
        }

        file.previewElement.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
        });
      }, this ));

      _.each(this.model.get('files'), _.bind(function(picture) {

        var mockFile = {
          name: picture.filename,
          size: picture.size
        }; // here we get the file name and size as response

        var url = 'files/'+mockFile.name;

        this.dropzone.emit('addedfile', mockFile);
        this.dropzone.emit('thumbnail', mockFile, url );

        this.dropzone.createThumbnailFromUrl(mockFile, url);

        this.dropzone.emit('complete', mockFile);
      }, this ));

      if( !userService.getAuthenticatedUser() ) {
        this.dropzone.disable();
      }

      return this;
    },

    _setDateField: function(fieldName, value) {
      if( value ) {
        this.ui[fieldName].datepicker('setDate', new Date(value));
      } else {
        this.ui[fieldName].val('');
      }
    },

    render: function() {

      ReceiptEditView.__super__.render.apply(this, arguments);

      this.$('.datepicker').datepicker();

      this._setDateField('purchaseDate', this.model.get('purchaseDate'));
      this._setDateField('warrantlyEndDate', this.model.get('warrantlyEndDate'));
      this._setDateField('registered', this.model.get('registered'));

      if(userService.getAuthenticatedUser()) {
        this.$('.tags').tagsinput();
      }

      this._renderDropZone();

      return this;
    }
  });

  return ReceiptEditView;
});
