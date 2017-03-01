define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!receipt-list/receipt-list-layout');

  var ReceiptListLayout = Backbone.Marionette.Layout.extend({

    template: template,

    regions: {
      menuView : '#list-menu',
      receiptListView : '#receipt-list'
    }
  });

  return ReceiptListLayout;

});
