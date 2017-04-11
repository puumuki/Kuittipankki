define(function(require) {

  var Backbone = require('backbone');
  var Communicator = require('communicator');
  var Router = require('router');
  var $ = require('jquery');
  var userService = require('services/user-service');
  var localizationService = require('localization/localization-service');

  require('jqueryui');
  require('moment-duration-format');
  require('handlebar-helpers/helpers');

  var App = new Backbone.Marionette.Application();

  App.router = new Router();

  /* Add initializers here */
  App.addInitializer( function () {

    userService.fetchAuthenticatedUser().then(function(user) {
      Communicator.mediator.trigger('app:user:authenticated', user);

      var localizations = localizationService.getLocalizations(user.get('lang'));

      //Datepicker localizations
      $.datepicker.regional.fi = localizations.datePickerTranslation;
      $.datepicker.setDefaults( localizations.datePickerTranslation );

      window.currentLanguage = user.get('lang');
    }).fail(function() {
      Communicator.mediator.trigger('app:user:notauthenticated');
    });

    Communicator.mediator.trigger('app:start');

    Backbone.history.start();
  });

  //Exposing Application to global scope
  window.App = App;

  return App;
});
