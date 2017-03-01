define(function(require) {

  var template = require('hbs!receipt-view/receipt');
  var userService = require('services/user-service');
  var _ = require('underscore');

  var effectService = require('services/effect-service');
  var moment = require('moment');

  var ImageDialogView = require('image-dialog-view/image-dialog-view');
  var FileDialogView = require('file-dialog-view/file-dialog-view');

  var helpers = require('handlebar-helpers/helpers');

  var BaseItemView = require('base-view/base-item-view');

  var ReceiptView = BaseItemView.extend({

    attachView: effectService.fadeIn,

    template: template,

    events: {
      'click a.thumbnail': '_onThumbnailClicked',
    },

    initialize: function() {
      ReceiptView.__super__.initialize.call(this);
      this.bindListener('app:user:logout',this.render);
      this.model.on('change', this.render);
    },

    _onThumbnailClicked: function(event) {

      event.preventDefault();

      var mimeType = $(event.currentTarget).data('mimetype');
      var url = $(event.currentTarget).data('url');

      var file = _.find( this.model.get('files'), function( file ) {
        return file.filename === url;
      });

      if( mimeType.startsWith('image') ) {
        new ImageDialogView({
          title: 'Kuva',
          receipt: this.model,
          file: file
        });
      } else {
        new FileDialogView({
          title: 'Tiedosto',
          receipt: this.model,
          file: file
        });
      }
    },

    _durationFromDate: function(date) {
      var format = 'YYYY-MM-DD hh:mm:ss';
      var purchaseDate = moment(date , format);
      var diff =moment(moment()).diff(purchaseDate);
      var translation = helpers.translate('receipt.age');
      return moment.duration(diff,'ms').format(translation);
    },

    serializeData: function() {
      return _.extend(ReceiptView.__super__.serializeData.call(this), {
        readonly: !userService.getAuthenticatedUser(),
        fromPurchase: this._durationFromDate(this.model.get('purchaseDate'))
      });
    },

    onClose: function() {
      // Removes all callbacks on `object`. This prevent that render is not called after view is 'destroyd'.
      this.model.off();
      ReceiptView.__super__.onClose.call(this);
    },

    render: function() {
      ReceiptView.__super__.render.apply(this, arguments);
      this.$('[data-toggle="tooltip"]').tooltip();
      window.scrollTo( 0, 0 );
      return this;
    }
  });

  return ReceiptView;
});
