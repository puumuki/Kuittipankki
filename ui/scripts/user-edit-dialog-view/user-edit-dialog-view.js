define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!user-edit-dialog-view/user-edit-dialog');
  var userService = require('services/user-service');
  var regionManager = require('region-manager');

  var UserEditViewDialog = Backbone.Marionette.ItemView.extend({

    template: template,

    events: {
      'click button[name="save"]' : '_onSaveButtonClick'
    },

    ui: {
      'username':'input[name="username"]'
    },


    initialize: function() {
      UserEditViewDialog.__super__.initialize.call(this);
      regionManager.getRegion('dialog').show(this);
    },

    serializeData: function() {
      return this.model.toJSON();
    },

    render: function() {
      UserEditViewDialog.__super__.render.call(this);
      this.$el.find('.modal').modal();
    },

    _userSaveSuccess: function() {
      //Nothing to do..
    },

    readData: function() {
      this.model.set('username', this.ui.username.val());
      return this.model;
    },

    _userSaveFailure: function(error) {
      console.error( "Userinformation saving failed", error );
    },

    _onSaveButtonClick: function() {
      userService.saveUser(this.readData())
      .then(_.bind(this._userSaveSuccess))
      .fail(_.bind(this._userSaveFailure));
    }

  });

  return UserEditViewDialog;

});