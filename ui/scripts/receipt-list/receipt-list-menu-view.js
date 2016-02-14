define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!receipt-list/receipt-list-menu');
  var ReceiptCollection = require('receipt-collection');
  var userService = require('services/user-service');
  var Communicator = require('communicator');
  var receiptService = require('services/receipt-service');
  var _ = require('underscore');

  var ReceiptListMenuView = Backbone.Marionette.ItemView.extend({

    template: template,

    ui: {
      'searchInput': '.search-input'
    },

    events: {
      'click button.sort' : '_sortBy',
      'keydown .search-input': '_onSearch'
    },

    _onSearch: function(event) {
      var search = this.ui.searchInput.val();

      if( search === '' ) {
        Communicator.mediator.trigger('app:receipt:searchend');
      } else {
        Communicator.mediator.trigger('app:receipt:search', search);
      }
    },

    serializeData: function() {
      return {
        sort: this.sort
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