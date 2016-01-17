define(function(require) {
    'use strict';

  var Backbone = require('backbone'), 
      Communicator = require('communicator'), 
      Router = require('router'), 
      $ = require('jquery'),
      userService = require('user-service');

  require('jqueryui');

  var App = new Backbone.Marionette.Application();

  App.router = new Router();

  //TODO: mode datapicker to seperated class
  $.datepicker.regional['fi'] = {
               closeText: 'Sulje',
               prevText: '&laquo;Edellinen',
               nextText: 'Seuraava&raquo;',
              currentText: 'T&auml;n&auml;&auml;n',
      monthNames: ['Tammikuu','Helmikuu','Maaliskuu','Huhtikuu','Toukokuu','Kes&auml;kuu',
        'Hein&auml;kuu','Elokuu','Syyskuu','Lokakuu','Marraskuu','Joulukuu'],
        monthNamesShort: ['Tammi','Helmi','Maalis','Huhti','Touko','Kes&auml;',
        'Hein&auml;','Elo','Syys','Loka','Marras','Joulu'],
                dayNamesShort: ['Su','Ma','Ti','Ke','To','Pe','Su'],
                dayNames: ['Sunnuntai','Maanantai','Tiistai','Keskiviikko','Torstai','Perjantai','Lauantai'],
                dayNamesMin: ['Su','Ma','Ti','Ke','To','Pe','La'],
                weekHeader: 'Vk',
        dateFormat: 'dd.mm.yy',
                firstDay: 1,
                isRTL: false,
                showMonthAfterYear: false,
                yearSuffix: ''
  };
      
  $.datepicker.setDefaults($.datepicker.regional['fi']);

  /* Add initializers here */
  App.addInitializer( function () {
    
    userService.fetchAuthenticatedUser().then(function(user) {
      Communicator.mediator.trigger('app:user:authenticated', user);
    });

    Communicator.mediator.trigger("app:start");
    
    Backbone.history.start();

  });

  //Exposing Application to global scope
  window.App = App;

  return App;
});
