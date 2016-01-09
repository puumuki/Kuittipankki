define(function(require) {
  var Backbone = require('backbone');
  var Receipt = require('receipt');
  var sorters = require('sorters')

  var ReceiptCollection = Backbone.Collection.extend({
      url: '/receipts',
      model: Receipt
    },{
      sorters: {
        name: sorters.alphabeticalSorter('name'),
        created: sorters.dateSorter('created'),
        updated: sorters.dateSorter('updated')
      }
  });

  return ReceiptCollection;
});