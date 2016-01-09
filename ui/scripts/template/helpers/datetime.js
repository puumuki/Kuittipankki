define(function(require) {

  var moment = require('momentjs');
  var Handlebars = require('handlebars');

  function dateTimeHelper(value) {
    var stringDate = moment(value).format("DD.MM.YYYY");
    return new Handlebars.SafeString(stringDate);
  }

  Handlebars.registerHelper('datetime', dateTimeHelper);
});