define(function(require) {

  var moment = require('moment');
  var Handlebars = require('handlebars');

  function dateTimeHelper(value) {
    if( moment(value).isValid() ) {
      return new Handlebars.SafeString(moment(value).format("DD.MM.YYYY"));
    } else {
      return "";
    }
  }

  Handlebars.registerHelper('datetime', dateTimeHelper);
});