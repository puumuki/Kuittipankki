define(function(require) {

  var _                   = require('underscore');
  var Backbone            = require('backbone');

  var LoadingView         = require('loading-view/loading-view');

  var ReceiptListLayout   = require('receipt-list/receipt-list-layout-view');
  var ReceiptListMenuView = require('receipt-list/receipt-list-menu-view');
  var ReceiptListView     = require('receipt-list/receipt-list-view');

  var ReceiptView         = require('receipt-view/receipt-view');

  var ReceiptEditView     = require('receipt-edit-view/receipt-edit-view');

  var LoginView           = require('login-view/login-view');
  var PictureView         = require('picture-view');

  var MenuView            = require('menu-view/menu-view');

  var Receipt             = require('receipt');
  var PageNotFoundView    = require('page-not-found-view');

  var regionManager       = require('region-manager');
  var receiptService      = require('services/receipt-service');
  var userService         = require('services/user-service');

  /* Regions */
  var menuRegion = regionManager.addRegion('menu','#menu');
  var contentRegion = regionManager.addRegion('content','#content');
  regionManager.addRegion('dialog', '#dialog');
  regionManager.addRegion('loadingdialog', '#loadingdialog');

  var Communicator = require('communicator');

  /**
   * Show view in region
   * @param {Marionette.Region} region, region where view is shown
   * @param {Marionette.View} view, view to be shown
   */
  function showView( region, view ) {
    region.reset();
    region.show( view );
  }

  /**
   * Way to customize view transition
   */
  Backbone.Marionette.Region.prototype.open = function(view){
    if(_.isFunction( view.attachView )) {
      _.bind( view.attachView, this)(view);
    } else {
      this.$el.html(view.el);
    }
  };

  var loginView = new LoginView();

  showView( contentRegion, loginView );
  showView( menuRegion, new MenuView());


  /**
   * @class ApplicationRouter
   * Application router coordinate transitions between views and routers
   */
  var ApplicationRouter = Backbone.Router.extend({

    initialize: function() {
      this.on('route', function( route ) {
        Communicator.mediator.trigger('app:route', route);
      });
    },

    routes: {
      '' : 'receiptList',
      'receipts/:page':'receiptList',
      'receipt/view/:id': 'receipt',    // #help
      'receipt/edit/:id': 'editReceipt',
      'receipt/edit': 'editReceipt',
      'receipt/new': 'newReceipt',
      'files/:fileName': 'file',
      'search/tag/:searchKey': 'searchTags',
      'login': 'login',
      'logout': 'logout'
    },

    receipt: function(id) {

      var promise = receiptService.fetchReceipt({
        id:id
      });

      promise.then(function(receipt) {
        showView( contentRegion, new ReceiptView({
          model: receipt
        }));
      }).fail(function(error) {
        showView( contentRegion, new PageNotFoundView());
        console.error('Could not fetch receipts', error);
      });
    },

    receiptList: function(page) {

      var receiptListLayout = new ReceiptListLayout();

      showView( contentRegion, receiptListLayout);

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
         showView( contentRegion, new ReceiptEditView({
          model: receipt
        }));
      }).fail(function(error) {
        showView( contentRegion, new PageNotFoundView());
        //TODO: Teepäs tähän utiliteetti dialogi error hässäkkä
        console.error('Could not fetch receipts', error);
      });
    },

    newReceipt: function() {
      receiptService.saveReceipt(new Receipt()).then(function(receipt) {
        showView( contentRegion, new ReceiptEditView({
          model: receipt
        }));
      }).fail(function(error) {
        //TODO: Teepäs tähän virheenkäsittely
        console.error(error);
      });
    },

    file: function(fileName) {
      var promise = receiptService.fetchReceipt({
        id: _.first( fileName.split('.') )
      });

      promise.then(function(receipt) {
        var _file = receipt.findFile( fileName );

        showView( contentRegion, new PictureView({
          receipt: receipt,
          file: _file
        }));
      }).fail(function(error) {
        showView( contentRegion, new PageNotFoundView());
        //TODO: Teepäs tähän utiliteetti dialogi error hässäkkä
        console.error('Could not fetch receipts', error);
      });
    },

    login: function() {
      showView( contentRegion, loginView );
    },

    logout: function() {
      userService.logout().then(function() {
        Communicator.mediator.trigger('app:user:logout');
        App.router.navigate('', {trigger:true});
      }).fail(function(error) {
        console.error('Error happened during logout', error);
      });
    },

    /**
     * Search receipt with a tag name
     *
     */
    searchTags: function( searchKey ) {

      var receiptListLayout = new ReceiptListLayout();
      showView( contentRegion, receiptListLayout);

      receiptListLayout.receiptListView.show( new LoadingView() );

      var promise = receiptService.fetchReceiptCollection();
      promise.then(function(receiptCollection) {

        var searchCollection = receiptService.searchReceipts( searchKey, {
          keys: ['tags']
        });

        receiptListLayout.menuView.show(new ReceiptListMenuView());

        receiptListLayout.receiptListView.show(new ReceiptListView({
          collection: searchCollection,
          page: 1
        }));

      }).fail(function(data) {
        console.error('Could not fetch receipts', data);
        if( data.res.status === 403 ) {
          App.router.navigate('#login', {trigger:true});
        }
      });
    }

  });

  return ApplicationRouter;
});
