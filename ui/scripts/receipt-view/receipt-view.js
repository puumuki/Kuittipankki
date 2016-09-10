define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!receipt-view/receipt');
  var userService = require('services/user-service');
  var _ = require('underscore');

  var communicator = require('communicator');
  var effectService = require('services/effect-service');
  var moment = require('moment');

  var ImageDialogView = require('image-dialog-view/image-dialog-view');

  var ReceiptView = Backbone.Marionette.ItemView.extend({

    attachView: effectService.fadeIn,

    template: template,

    events: {
      'click a.thumbnail': '_onThumbnailClicked',
    },

    initialize: function() {
      communicator.mediator.on('app:user:logout', _.bind(this.render, this));
      this.model.on('change', this.render);
    },

    _onThumbnailClicked: function(event) {
        
      event.preventDefault();

      var mimeType = $(event.currentTarget).data('mimetype');
      var url = $(event.currentTarget).data('url');

      if( mimeType.startsWith('image') ) {
        new ImageDialogView({
          title: 'Kuva',
          receipt: this.model,
          image: url
        });        
      } else {
        window.open( 'files/' + url );
      }
    },

    _durationFromDate: function(date) {
      var format = 'YYYY-MM-DD hh:mm:ss';
      var purchaseDate = moment(date , format);
      var diff =moment(moment()).diff(purchaseDate);
      return moment.duration(diff,'ms').format('y [vuotta] d [päivää]');
    },

    serializeData: function() {      
      return _.extend(ReceiptView.__super__.serializeData.call(this), {
        readonly: !userService.getAuthenticatedUser(),
        fromPurchase: this._durationFromDate(this.model.get('purchaseDate'))
      });
    },

    render: function() {
      ReceiptView.__super__.render.apply(this, arguments);
      window.scrollTo( 0, 0 );
      return this;
    }
  });

  return ReceiptView;
});