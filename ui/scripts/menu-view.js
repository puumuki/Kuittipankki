define(function(require) {

  var _ = require('underscore');

  var Backbone = require('backbone');
  var template = require('hbs!tmpl/menu');
  var Communicator = require('communicator');

  var RecipeListView = Backbone.Marionette.ItemView.extend({

    template: template,

    ui: {
      'searchNav': '#search-nav',
      'navbarToggle': '.navbar-toggle',
      'searchInput': '.search-input'
    },

    events: {
      'click #menu-bar a' : '_onNavbarToggleClicked',
      'click .search': '_onSearchClicked',
      'keydown .search-input': '_onSearch',
      'click .large-close': '_endSearch'
    },

    initialize: function(){
      Communicator.mediator.on('app:user:authenticated',_.bind( this._onAuthenticated, this));
      Communicator.mediator.on('app:user:logout', _.bind( this._onLogout, this));
      Communicator.mediator.on('app:route', _.bind( this._endSearch, this));
    },

    serializeData: function() {
      var data =RecipeListView.__super__.serializeData.call(this);

      return _.extend( data, {
        user: this._userobject
      });
    },

    _onSearchClicked: function(event) {
      event.preventDefault();
        if ( this.ui.searchNav.is( ':hidden' ) ) {
          this.ui.searchNav.fadeIn('slow');
        } else {
          this.ui.searchNav.fadeOut('slow');
          this._endSearch();
        }
    },

    _endSearch: function() {
      this.ui.searchNav.fadeOut('slow');
      Communicator.mediator.trigger('app:receipt:searchend');
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

    _onSearch: function(event) {
      if( event.keyCode === 27 ) {
        return this._endSearch();
      }
      Communicator.mediator.trigger('app:receipt:search', this.ui.searchInput.val());
    },

    render: function() {
      RecipeListView.__super__.render.call(this);
      this.ui.searchNav.hide();
    }

  });

  return RecipeListView;
});