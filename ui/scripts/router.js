define(function(require) {

  var _ = require('underscore');
  var Backbone = require('backbone');

  var LoadingView = require('loading-view/loading-view');

  var ReceiptListLayout =   require('receipt-list/receipt-list-layout-view');  
  var ReceiptListMenuView = require('receipt-list/receipt-list-menu-view');
  var ReceiptListView =     require('receipt-list/receipt-list-view');

  var ReceiptView = require('receipt-view/receipt-view');

  var ReceiptEditView = require('receipt-edit-view/receipt-edit-view');

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
  regionManager.addRegion('dialog', '#dialog');
  var contentRegion = regionManager.addRegion('content','#content');

  var Communicator = require('communicator');

  Backbone.Marionette.Region.prototype.open = function(view){
    if(_.isFunction( view.attachView )) {
      _.bind( view.attachView, this)(view) ;
    } else {
      this.$el.html(view.el);
    }
  };

  var loginView = new LoginView();

  contentRegion.show(loginView);
  menuRegion.show(new MenuView());

  var ApplicationRouter = Backbone.Router.extend({

    initialize: function() {
      this.on('route', function() {
        Communicator.mediator.trigger('app:route');
      });
    },

    routes: {
      '' : 'receiptList',
      'receipts/:page':'receiptList',
      'receipt/view/:id': 'receipt',    // #help
      'receipt/edit/:id': 'editReceipt',
      'receipt/edit': 'editReceipt',
      'receipt/new': 'newReceipt',
      'picture/:image': 'picture',
      'login': 'login',
      'logout': 'logout'
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
        console.error('Could not fetch receipts', error);        
      });
    }, 

    receiptList: function(page) {

      var receiptListLayout = new ReceiptListLayout();
      contentRegion.show(receiptListLayout);
      
      receiptListLayout.receiptListView.show( new LoadingView() );

      var promise = receiptService.fetchReceiptCollection();
 
      promise.then(function(receiptCollection) {
        
        receiptListLayout.menuView.show(new ReceiptListMenuView());
      
        receiptListLayout.receiptListView.show(new ReceiptListView({
          collection: receiptCollection,
          page: page
        }));

      }).fail(function(data) {
        console.error('Could not fetch receipts', data);
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
        console.error('Could not fetch receipts', error);        
      });
    }, 

    newReceipt: function() {
      receiptService.saveReceipt(new Receipt()).then(function(receipt) {
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

      promise.then(function(receipt) {
        contentRegion.show(new PictureView({
          receipt: receipt,
          image : image
        }));      
      }).fail(function(error) {
        contentRegion.show(new PageNotFoundView());
        //TODO: Teepäs tähän utiliteetti dialogi error hässäkkä
        console.error('Could not fetch receipts', error);        
      });
    },

    login: function() {
      contentRegion.show(loginView);
    },

    logout: function() {
      userService.logout().then(function() {
        Communicator.mediator.trigger('app:user:logout');
        App.router.navigate('', {trigger:true});
      }).fail(function(error) {
        console.error('Error happened during logout', error);
      });
    }

  });

  return ApplicationRouter;

});