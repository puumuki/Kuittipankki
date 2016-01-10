define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!tmpl/menu')
  var Communicator = require('communicator');
  var _ = require('underscore');

  var RecipeListView = Backbone.Marionette.ItemView.extend({

    template: template,

    initialize: function(){
      Communicator.mediator.on('app:user:authenticated',_.bind( this._onAuthenticated, this));
      Communicator.mediator.on('app:user:logout', _.bind( this._onLogout, this));
    },

    serializeData: function() {
      var data =RecipeListView.__super__.serializeData.call(this);

      return _.extend( data, {
        user: this._userobject
      });
    },

    _onLogout: function() {
      this._userobject = null;
      this.render();
    },

    _onAuthenticated: function(data) {
      this._userobject = data;
      this.render();
    }

  });

  return RecipeListView;
});