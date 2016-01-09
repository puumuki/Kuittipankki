define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!tmpl/receipt');
  var receiptService = require('receipt-service');

  var ReceiptView = Backbone.Marionette.ItemView.extend({

    template: template,

    events: {
      'click button[name="delete"]' : '_deleteReceipt'
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

    render: function() {
      ReceiptView.__super__.render.apply(this, arguments);
      return this;
    }

  });

  return ReceiptView;
});