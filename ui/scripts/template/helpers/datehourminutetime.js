define(function(require) {

  var moment = require('moment');
  var Handlebars = require('handlebars');

  function dateTimeHelper(value, format) {

    if( moment(value).isValid() ) {
      return new Handlebars.SafeString(moment(value).format('DD.MM.YYYY HH:mm'));
    } else {
      return '';
    }
  }

  Handlebars.registerHelper('datehourminutetime', dateTimeHelper);
});
