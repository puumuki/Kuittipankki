define(function(require) {

  var _ = require('underscore');

  var template = require('hbs!menu-view/menu');
  var Communicator = require('communicator');
  var BaseItemView = require('base-view/base-item-view');

  var MenuItems = {
    'Receipts' : 'receipts',
    'Reports' : 'reports'
  };

  var RecipeListView = BaseItemView.extend({

    template: template,

    ui: {
      'searchNav': '#search-nav',
      'navbarToggle': '.navbar-toggle'
    },

    events: {
      'click #menu-bar a' : '_onNavbarToggleClicked',
      'click .translation' : '_changeLanguage'
    },

    initialize: function(){
      RecipeListView.__super__.initialize.call(this);
      Communicator.mediator.on('app:user:authenticated',_.bind( this._onAuthenticated, this));
      Communicator.mediator.on('app:user:logout', _.bind( this._onLogout, this));
      Communicator.mediator.on('app:route', _.bind( this._routeChanged, this));
    },

    serializeData: function() {
      var data =RecipeListView.__super__.serializeData.call(this);

      return _.extend( data, {
        user: this._userobject,
        active: this._active
      });
    },

    _changeLanguage: function(event) {
      event.preventDefault();
      var language = $(event.currentTarget).data('lang');
      window.currentLanguage = language;
      Communicator.mediator.trigger('language:change', language);
      console.log("Changing language " + language);
    },

    _routeChanged: function(route) {
      this._active = MenuItems.Receipts;

      if( route !== 'receiptList' ) {
        this.ui.searchNav.fadeOut('slow');
        Communicator.mediator.trigger('app:receipt:searchend');
      }

      if( route.includes('reports') ) {
        this._active = MenuItems.Reports;
      }

      this.render();
    },

    _onLogout: function() {
      this._userobject = null;
      this.render();
    },

    _onAuthenticated: function(data) {
      this._userobject = data;
      this.render();
    },

    _onNavbarToggleClicked: function(event) {
      if( !!$(event.currentTarget).data('refresh') ) {
        this.render();
      }
    },

    render: function() {
      RecipeListView.__super__.render.call(this);
      this.ui.searchNav.hide();
    }

  });

  return RecipeListView;
});
