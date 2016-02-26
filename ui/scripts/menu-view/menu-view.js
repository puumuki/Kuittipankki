define(function(require) {

  var _ = require('underscore');

  var Backbone = require('backbone');
  var template = require('hbs!menu-view/menu');
  var Communicator = require('communicator');
  var userService = require('services/user-service');
  var UserEditDialogView = require('user-edit-dialog-view/user-edit-dialog-view');

  var RecipeListView = Backbone.Marionette.ItemView.extend({

    template: template,

    ui: {
      'searchNav': '#search-nav',
      'navbarToggle': '.navbar-toggle'
    },

    events: {
      'click #menu-bar a' : '_onNavbarToggleClicked',
      'click #user-edit a' : '_userEditDialog'
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

    _userEditDialog: function(event) {
      event.preventDefault();

      userService.fetchAuthenticatedUser().then(function(user) {
        var userEditDialog = new UserEditDialogView({ model: user });
      }).fail(function(error) {
        console.error("Failed fetch user information", error);
      });
    },

    render: function() {
      RecipeListView.__super__.render.call(this);
      this.ui.searchNav.hide();
    }

  });

  return RecipeListView;
});