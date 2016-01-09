define(function(require) {

  var Backbone = require('backbone');
  var ReceiptView = require('receipt-view');
  var ReceiptListView = require('receipt-list-view');
  var ReceiptEditView = require('receipt-edit-view');
  var PictureView = require('picture-view');

  var Receipt = require('receipt');
  var regionManager = require('regionManager');
  var receiptService = require('receipt-service');
  
  var contentRegion = regionManager.addRegion('content','#content');

  var ApplicationRouter = Backbone.Router.extend({

    routes: {
      "" : "receiptList",
      ":page": "receiptList",
      "receipt/view/:id": "receipt",    // #help
      "receipt/edit/:id": "editReceipt",
      "receipt/edit": "editReceipt",
      "receipt/new": "newReceipt",
      "picture/:image": "picture"
    },

    receipt: function(id) {
      
      var promise = receiptService.fetchReceipt({
        id:id
      });

      promise.then(function(receipt) {
        contentRegion.show(new ReceiptView({
          model: receipt
        }));        
      }).fail(function(error) {
        //TODO: Teepäs tähän utiliteetti dialogi error hässäkkä
        console.error("Could not fetch receipts", error);        
      });
    }, 

    receiptList: function(page) {

      var promise = receiptService.fetchReceiptCollection();
 
      promise.then(function(receiptCollection) {
        contentRegion.show(new ReceiptListView({
          collection: receiptCollection,
          page: page
        }));
      }).fail(function(error) {
        //TODO: Teepäs tähän utiliteetti dialogi error hässäkkä
        console.error("Could not fetch receipts", error);
      });
    },

    editReceipt: function(id) {
      var promise = receiptService.fetchReceipt({id:id});

      promise.then(function(receipt) {
         contentRegion.show(new ReceiptEditView({
          model: receipt
        }));    
      }).fail(function(error) {
        //TODO: Teepäs tähän utiliteetti dialogi error hässäkkä
        console.error("Could not fetch receipts", error);        
      });
    }, 

    newReceipt: function() {
      receiptService.saveReceipt(new Receipt()).then(function(receipt) {
        console.log( receipt.get('id'))
        contentRegion.show(new ReceiptEditView({
          model: receipt
        }));
      }).fail(function(error) {
        //TODO: Teepäs tähän virheenkäsittely
        console.error(error);
      });
    }, 

    picture: function(image) {
      var promise = receiptService.fetchReceipt({
        id: _.first( image.split('.') )
      });

      console.log( _.first( image.split('.') ));

      promise.then(function(receipt) {
        contentRegion.show(new PictureView({
          receipt: receipt,
          image : 'pictures/'+image
        }));      
      }).fail(function(error) {
        //TODO: Teepäs tähän utiliteetti dialogi error hässäkkä
        console.error("Could not fetch receipts", error);        
      });
    }

  });

  return ApplicationRouter;

});