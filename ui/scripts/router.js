define(function(require) {

  var _ = require('underscore');
  var Backbone = require('backbone');
  var ReceiptView = require('receipt-view');
  var ReceiptListView = require('receipt-list-view');
  var ReceiptEditView = require('receipt-edit-view');
  var LoginView = require('login-view');
  var PictureView = require('picture-view');
  var MenuView = require('menu-view');
  var Receipt = require('receipt');
  var PageNotFoundView = require('page-not-found-view');

  var regionManager = require('region-manager');
  var receiptService = require('receipt-service');
  var userService = require('user-service');
  
  /* Regions */
  var menuRegion = regionManager.addRegion('menu','#menu'); 
  var dialogRegion = regionManager.addRegion('dialog', '#dialog');
  var contentRegion = regionManager.addRegion('content','#content');

  var Communicator = require('communicator');

  var ContentRegion = Backbone.Marionette.Region.extend({});

  Backbone.Marionette.Region.prototype.open = function(view){
    if(_.isFunction( view.attachView )) {
      _.bind( view.attachView, this)(view) ;
    } else {
      this.$el.html(view.el);
    }
  }

  var contentRegion = regionManager.getRegion('content');

  contentRegion.show(new LoginView());
  menuRegion.show(new MenuView());

  var ApplicationRouter = Backbone.Router.extend({

    routes: {
      "" : "receiptList",
      "receipts/:page":"receiptList",
      "receipt/view/:id": "receipt",    // #help
      "receipt/edit/:id": "editReceipt",
      "receipt/edit": "editReceipt",
      "receipt/new": "newReceipt",
      "picture/:image": "picture",
      "login": "login",
      "logout": "logout"
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
        contentRegion.show(new PageNotFoundView());
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
      }).fail(function(data) {
        console.error("Could not fetch receipts", data.error);
        console.log(data);
        if( data.res.status === 403 ) {
          App.router.navigate('#login', {trigger:true});
        }       
      });
    },

    editReceipt: function(id) {
      var promise = receiptService.fetchReceipt({id:id});

      promise.then(function(receipt) {
         contentRegion.show(new ReceiptEditView({
          model: receipt
        }));    
      }).fail(function(error) {
        contentRegion.show(new PageNotFoundView());
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
        console.log(";D;D;",error);
        //TODO: Teepäs tähän virheenkäsittely
        console.error(error);
      });
    }, 

    picture: function(image) {
      var promise = receiptService.fetchReceipt({
        id: _.first( image.split('.') )
      });

      promise.then(function(receipt) {
        contentRegion.show(new PictureView({
          receipt: receipt,
          image : image
        }));      
      }).fail(function(error) {
        contentRegion.show(new PageNotFoundView());
        //TODO: Teepäs tähän utiliteetti dialogi error hässäkkä
        console.error("Could not fetch receipts", error);        
      });
    },

    login: function() {
      contentRegion.show(new LoginView());
    },

    logout: function() {
      userService.logout().then(function(data) {
        Communicator.mediator.trigger('app:user:logout');
        App.router.navigate("", {trigger:true});
      }).fail(function(error) {
        console.error("Error happened during logout", error);
      })
    }

  });

  return ApplicationRouter;

});