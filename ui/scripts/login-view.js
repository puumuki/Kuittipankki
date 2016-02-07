define(function(require) {

  var Backbone = require('backbone');
  var userService = require('user-service');
  var _ = require('underscore');
  
  var LoginView = Backbone.Marionette.ItemView.extend({

    el: $('#login'),

    ui: {
      'content' : '.row',
      'error'   : '.alert-warning',
      'username':'input[name="username"]',
      'password':'input[name="password"]'
    },

    events: {
      'click .login-btn':'_login',
    },

    serializeData: function() {
      var data = LoginView.__super__.serializeData.call(this);

      return _.extend(data, {
        loginFailed: this._loginFailed
      });
    },

    _login: function(event) {
      event.preventDefault();
      var promise = userService.authenticate(this.ui.username.val(), 
                                             this.ui.password.val());

      promise.then(_.bind(function(data) {
        this._loginFailed = false;
        App.router.receiptList();
      }, this)).fail(_.bind(function(error) {
        this._loginFailed = true;
        this.render();
      }, this));
    },

    render: function() {

      this.bindUIElements();
      this.delegateEvents();

      this.ui.content.removeClass('hidden');
      this.ui.error.toggleClass('hidden', !this._loginFailed);      
    }
  });

  return LoginView;
});