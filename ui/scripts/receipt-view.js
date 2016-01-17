define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!tmpl/receipt');
  var receiptService = require('receipt-service');
  var userService = require('user-service');
  var _ = require('underscore');
  var communicator = require('communicator');
  var ConfirmationDialogView = require('confirmation-dialog-view');
  var effectService = require('effect-service');
  var moment = require('momentjs');
  require('moment-duration-format');

  var ReceiptView = Backbone.Marionette.ItemView.extend({

    attachView: effectService.fadeIn,

    template: template,

    events: {
      'click button[name="delete"]' : '_deleteReceiptClick'
    },

    initialize: function() {
      communicator.mediator.on('app:user:logout', _.bind(this.render, this));
    },

    _deleteReceiptClick: function() {
      var confirmationDialog = new ConfirmationDialogView({
        title: "Kuitin poisto",
        text: "Haluato varmasti poistaa kuitin?",
        onOk: _.bind( this._deleteReceipt, this )
      });
    },

    _deleteReceipt: function() {
      var promise = receiptService.deleteReceipt(this.model);

      promise.then(function(data) {
        App.router.navigate("#", {trigger:true});
      }).fail(function(error) {
        console.error(error);
        //TODO: Make error handling
      });
    },

    _durationFromDate: function(date) {
      var format = 'YYYY-MM-DD hh:mm:ss';
      var purchaseDate = moment(date , format);
      var diff =moment(moment()).diff(purchaseDate);
      return moment.duration(diff,'ms').format("y [vuotta] d [päivää] h [tuntia]");
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