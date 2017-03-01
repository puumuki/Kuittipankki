define(function(require) {

  var template = require('hbs!receipt-list/receipt-list-menu');
  var Communicator = require('communicator');
  var BaseItemView = require('base-view/base-item-view');

  var lastSearchText = '';

  var ReceiptListMenuView = BaseItemView.extend({

    template: template,

    ui: {
      'searchInputReqular': '.search-input-reqular',
      'searchInputSmall': '.search-input-small',
    },

    events: {
      'click button.sort' : '_sortBy',
      'keydown .search-input-reqular': '_onSearchReqular',
      'keydown .search-input-small': '_onSearchSmall',
      'click .search-btn': '_onSearchButtonClick'
    },

    _search: function( search ) {
      lastSearchText = search;
      if( search === '' ) {
        Communicator.mediator.trigger('app:receipt:searchend');
      } else {
        Communicator.mediator.trigger('app:receipt:search', search);
      }
    },

    _onSearchButtonClick: function(event) {
      var searchInputSelector = $(event.currentTarget).data('searchinput');
      var searchText = this.$(searchInputSelector).val();
      this._search( searchText );
    },

    _onSearchSmall: function(event) {
      this._search( this.ui.searchInputSmall.val() );
    },

    _onSearchReqular: function(event) {
      this._search( this.ui.searchInputReqular.val() );
    },

    serializeData: function() {
      return {
        sort: this.sort,
        searchText: lastSearchText
      };
    },

    _sortBy: function(event) {
      this.sort = {
        attribute: $(event.currentTarget).data('sort'),
        order: $(event.currentTarget).data('order') === 'asc' ? 'desc' : 'asc',
      };

      Communicator.mediator.trigger('app:receipt:sort', this.sort);
      this.render();
    }
  });

  return ReceiptListMenuView;
});
