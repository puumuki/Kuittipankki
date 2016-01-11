define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!tmpl/login');
  var userService = require('user-service');
  var _ = require('underscore');
  
  var LoginView = Backbone.Marionette.ItemView.extend({

    template: template,

    ui: {
      'username':'input[name="username"]',
      'password':'input[name="password"]'
    },

    events: {
      'click .login-btn':'_login'
    },

    serializeData: function() {
      var data = LoginView.__super__.serializeData.call(this);

      return _.extend(data, {
        loginFailed: this._loginFailed
      });
    },

    _login: function() {
      var promise = userService.authenticate(this.ui.username.val(), this.ui.password.val());

      promise.then(function(data) {
        App.router.receiptList();
      }).fail(_.bind(function(error) {
        this._loginFailed = true;
        this.render();
      }, this));
    }
  });

  return LoginView;
});