define(function(require) {
    'use strict';

  var Backbone = require('backbone'), 
      Communicator = require('communicator'), 
      Router = require('router'), 
      MenuView = require('menu-view'),
      $ = require('jquery'), 
      ReceiptListView = require('receipt-list-view');

	var App = new Backbone.Marionette.Application();

  App.router = new Router();

  App.navigate = function(url) {
    console.log('Navigating to '+url);
    //window.location.href = url;
    window.location.href = '#receipt/4';
  }

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

	/* Add application regions here */
	App.addRegions({});

	/* Add initializers here */
	App.addInitializer( function () {
    
    var menu = new MenuView();
    menu.setElement($('#menu'));
    menu.render();

		//document.body.innerHTML = indexTemplate({ success: "CONGRATS!" });
		Communicator.mediator.trigger("APP:START");
    Backbone.history.start();

	});

  //Exposing Application to global scope
  window.App = App;

	return App;
});
