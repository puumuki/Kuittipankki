define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!tmpl/receipt-list');
  var ReceiptCollection = require('receipt-collection');
  var userService = require('user-service');
  var Communicator = require('communicator');
  var receiptService = require('receipt-service');
  var _ = require('underscore');

  var items = 10;

  var ReceiptListView = Backbone.Marionette.ItemView.extend({

    template: template,

    events: {
      'click button.sort' : '_sortBy'
    },

    initialize: function( options ) {
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

      Communicator.mediator.on('app:user:logout', _.bind(this._logout,this));
      Communicator.mediator.on('app:receipt:search', _.bind(this._onReceiptSearch, this));
      Communicator.mediator.on('app:receipt:searchend',_.bind(this._onReceiptSearchEnds, this));
    },

    _onReceiptSearchEnds: function() {
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

    _sortBy: function(event) {

      this.sort = {
        attribute: $(event.currentTarget).data('sort'),
        order: $(event.currentTarget).data('order') === 'asc' ? 'desc' : 'asc',
      };

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

    serializeData: function() {

      //TODO: Impelement sort by date
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
        receipts: _.map( slice, function(item) {
          return item.toJSON();
        })
      };
    }

  });

  return ReceiptListView;
});