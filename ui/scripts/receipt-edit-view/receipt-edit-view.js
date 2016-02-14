  define(function(require) {

  var template = require('hbs!receipt-edit-view/receipt-edit');

  var Backbone = require('backbone');
  var moment = require('moment');
  var receiptService = require('receipt-service');
  var Communicator = require('communicator');
  var userService = require('user-service');
  var ImageDialogView = require('image-dialog-view');
  var _ = require('underscore');
  var effectService = require('effect-service');
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
      'keyup input[name="name"]':'_updateName',
      'click button[name="save"]':'_save',
      'click .dz-image-preview': '_openImage'
    },

    initialize: function() {
      Communicator.mediator.on('app:user:logout',_.bind(this._onLogout, this));
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
        App.router.navigate('#receipt/view/'+receipt.get('id'), {trigger:true});
      }).fail(function(error) {
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
        acceptedFiles: 'image/*', 
        addRemoveLinks: false,
        dictDefaultMessage: 'Raahaa kuvat ja pudota kuvat tähän, latausta varten.',
        headers: {
          'receipt-id':this.model.get('id')
        },
        init: function() {
          
        }
      });

      this.dropzone.on('success', _.bind(this._fileUploaded, this) );

      _.each(this.model.get('pictures'), _.bind(function(picture) {
        var mockFile = { name: picture.filename, size: picture.size }; // here we get the file name and size as response 

        var url = 'pictures/'+mockFile.name;

        this.dropzone.emit('addedfile', mockFile);      
        this.dropzone.emit('thumbnail', mockFile, url );

        this.dropzone.createThumbnailFromUrl(mockFile, url);

        this.dropzone.emit('complete', mockFile);
      }, this));

      if( !userService.getAuthenticatedUser() ) {
        this.dropzone.disable();  
      }     

      //Cancel preview click on added file, file name is not 
      this.dropzone.on('addedfile', function(file) {
        file.previewElement.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
        });
      });

      return this;
    },

    _setDateField: function(fieldName, value) {
      if( value ) {
        this.ui[fieldName].datepicker('setDate', new Date(value));
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