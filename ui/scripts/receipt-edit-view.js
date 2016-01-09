define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!tmpl/receipt-edit');
  var moment = require('momentjs');
  var receiptService = require('receipt-service');
  var fileUploadService = require('file-upload-service');

  function formatDate(dateString) {
    return moment(dateString,'DD.MM.YYYY').format('YYYY-MM-DD HH:mm:ss');
  }

  var ReceiptEditView = Backbone.Marionette.ItemView.extend({

    template: template,

    ui: {
      'title':'.title',
      'name':'input[name="name"]',
      'store': 'input[name="store"]',
      'warrantlyEndDate': 'input[name="warrantlyEndDate"]',
      'registered': 'input[name="registered"]',
      'purchaseDate':'input[name="purchaseDate"]',
      'tags':'input[name="tags"]',
      'pictureName': 'input[name="pictureName"]',
      'picturePreview': '.picturePreview'
    },

    events: {
      'keyup input[name="name"]':'_updateName',
      'click button[name="save"]':'_save',
      'click .dz-image-preview': '_openImage'
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
      App.router.navigate("#picture/"+filename, {trigger:true});
    },

    _fileUploaded: function() {
      if( this.model.get('id') ) {
        this.model.fetch(null, {});  
      } else {
        receiptService.saveReceipt(this.model);
      }
    },

    _save: function(e) {
      var data = this.readData();

      this.model.set('name', this.ui.name.val() );
      this.model.set('store', this.ui.store.val() );
      this.model.set('warrantlyEndDate', formatDate( this.ui.warrantlyEndDate.val() ));
      this.model.set('registered', formatDate( this.ui.registered.val() ));
      this.model.set('purchaseDate', formatDate( this.ui.purchaseDate.val() ));
      this.model.set('tags', this.ui.tags.val().split(',') );      

      var promise = receiptService.saveReceipt(this.model);

      promise.then(function(receipt) {
        App.router.navigate("#receipt/view/"+receipt.get('id'), {trigger:true});
      }).fail(function(error) {
        console.log(error);
        //TODO: Implementoi virhekäsittely
      });
    },

    serializeData: function() {
      var data = this.model.toJSON();
      data.tags = _.filter( this.model.get('tags'), function(tag) {
        return tag !== "";
      }).join(',');
      return data;
    },

    readData: function() {
      return this.$(':input').map(function() {
        return { field: $(this).attr('name'), value : $(this).val() };
      });
    },

    _renderDropZone: function() {

      this.dropzone = new window.Dropzone(this.$(".dropzone").get(0), {
        url: "/upload", 
        acceptedFiles: 'image/*', 
        addRemoveLinks: false,
        dictDefaultMessage: "Raahaa kuvat ja pudota kuvat tähän, latausta varten.",
        headers: {
          "receipt-id":this.model.get('id')
        }
      });

      this.dropzone.on('success', _.bind(this._fileUploaded, this) );

      _.each(this.model.get('pictures'), _.bind(function(picture) {
        var mockFile = { name: picture.filename, size: picture.size }; // here we get the file name and size as response 

        var url = "pictures/"+mockFile.name;

        this.dropzone.emit("addedfile", mockFile);      
        this.dropzone.emit("thumbnail", mockFile, url );

        var thumb = this.dropzone.createThumbnailFromUrl(mockFile, url);

        this.dropzone.emit("complete", mockFile);
      }, this));


      return this;
    },

    render: function() {
      ReceiptEditView.__super__.render.apply(this, arguments);
      this.$('.datepicker').datepicker();
      this.ui.purchaseDate.datepicker("setDate", new Date(this.model.get('purchaseDate')));
      this.ui.warrantlyEndDate.datepicker("setDate", new Date(this.model.get('warrantlyEndDate')));
      this.ui.registered.datepicker("setDate", new Date(this.model.get('registered')));
      this.$(".tags").tagsinput();
      this._renderDropZone();
      return this;
    }
  });

  return ReceiptEditView;
});