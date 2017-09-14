define(function(require) {

  var template = require('hbs!receipt-list/receipt-list');
  var ReceiptCollection = require('collections/receipt-collection');
  var userService = require('services/user-service');
  var receiptService = require('services/receipt-service');
  var _ = require('underscore');
  var BaseItemView = require('base-view/base-item-view');

  var items = 10;

  var ReceiptListView = BaseItemView.extend({

    template: template,

    events: {
      'click .tag-link': '_onTagClicked'
    },

    /**
     * @constructor
     * @param {ReceiptCollection} options.collection receipt collectionsearchReceipts
     * @param {Integer} options.items items shown in a single page
     * @param {Integer} options.page page number, note index start from 1
     */
    initialize: function( options ) {

      ReceiptListView.__super__.initialize.call(this);

      this.sort = {
        attribute: 'name',
        order: 'asc'
      };

      var opts = _.defaults( options, {
        page: 1,
        items: items
      });

      this.page = parseInt( opts.page, 10 );
      this.items = opts.items;

      this.bindListener('app:user:logout', this._logout, this);

      //Triggered by ReceiptListMenuView when a key is pressed down
      this.bindListener('app:receipt:search', this._onReceiptSearch, this);

      //Triggered by ReceiptListMenuView when a search text box is empty
      this.bindListener('app:receipt:searchend', this._onReceiptSearchEnds, this);

      //Triggered when a receipts are sorted by date or name
      this.bindListener('app:receipt:sort', this._sortBy, this);
    },

    _onReceiptSearchEnds: function() {
      receiptService.resetReceiptSearch();
      this.collection = receiptService.getReceiptCollection();
      this.render();
    },

    _onReceiptSearch: function(search) {
      this.collection = receiptService.searchReceipts(search);
      this.render();
    },

    _logout: function() {
      this.render();
    },

    _sortBy: function(sort) {
      this.sort = sort;
      this.render();
    },

    _countOfPages: function() {
      return this.collection.size() / this.items;
    },

    _pages: function( activePage ) {
      var pages = this._countOfPages();

      pages = _.map( _.range(0, pages) , function( i ) {
        return {
          page: i + 1,
          active: i+1 === activePage
        };
      });

      return pages;
    },

    _previousPage: function() {
      var page = this.page - 1;

      if( page <= 1 ) {
        page = 1;
      }

      return page;
    },

    _nextPage: function() {
      var page = this.page + 1;

      if( page > this._countOfPages() + 1 ) {
        page = this.page;
      }

      return page;
    },

    _onTagClicked: function(event) {
      event.preventDefault();
      var tag = $(event.currentTarget).data('tag');
      App.router.navigate('#search/tag/' + tag, {trigger:true} );
    },

    isSearchOn: function() {
      return this.isSearchOn;
    },

    serializeData: function() {

      this.collection.comparator = _.bind(
        ReceiptCollection.sorters[this.sort.attribute],
        {reverse: this.sort.order === 'desc'}
      );

      this.collection.sort();

      var slice = this.collection.slice( (this.page-1) * this.items,
                                          this.page * this.items );

      return {
        authenticated: !!userService.getAuthenticatedUser(),
        previousPage: this._previousPage(),
        nextPage: this._nextPage(),
        size: this.collection.size(),
        pages: this._pages(this.page),
        showPagination: this._countOfPages() > 1,
        sort: this.sort,
        receipts: _.map( slice, function(receipt) {
          var receiptJSON = receipt.toJSON();
          var tagJSON = receipt.get('tags').toJSON();
          receiptJSON.tags = tagJSON;
          return receiptJSON;
        })
      };
    }

  });

  return ReceiptListView;
});
