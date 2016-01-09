define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!tmpl/receipt-list');
  var ReceiptCollection = require('receipt-collection');

  var items = 10;
  var offset = 0;

  var ReceiptListView = Backbone.Marionette.ItemView.extend({

    template: template,

    events: {
      "click button.sort" : "_sortBy"
    },

    initialize: function( options ) {
      this.sort = {
        attribute: 'name',
        order: 'asc'
      }

      var opts = _.defaults( options, {
        page: 1,
        items: items
      });

      this.page = parseInt( opts.page, 10 );
      this.items = opts.items;
    },

    _sortBy: function(event) {

      this.sort = {
        attribute: $(event.currentTarget).data('sort'),
        order: $(event.currentTarget).data('order') === 'asc' ? 'desc' : 'asc',
      };

      console.log( this.sort );

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
        previousPage: this._previousPage(),
        nextPage: this._nextPage(),
        size: this.collection.size(),
        pages: this._pages(this.page),
        sort: this.sort,
        receipts: _.map( slice, function(item) {
          return item.toJSON();
        })
      };
    }

  });

  return ReceiptListView;
});