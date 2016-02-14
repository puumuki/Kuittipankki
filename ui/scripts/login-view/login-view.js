define(function(require) {

  var Backbone = require('backbone');
  var userService = require('services/user-service');
  var _ = require('underscore');
  
  /**
   * This is a LoginView that registered users are using to authenticate.
   * The view is a special, it don't use a template like all other view, 
   * but uses a jQuery selector $('#login') as a point to attach to DOM. 
   * It's done this way to allow browser password managers to find the login
   * form from the DOM.
   * 
   * There are problems to password managers to regonize the login form
   * if the form is generated dynamically. By including the login form
   * index.html the form is part of the statically loaded resources, this way
   * the password managers has better change to regonize the login form
   * as a login form.
   */
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
        this.$el.effect('shake', 1000);
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