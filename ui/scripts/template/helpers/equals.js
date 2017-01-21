define(function(require) {

  var Handlebars = require('handlebars');

  /**
   * Handlebar helper that work like if statement but can compare two values
   * @param {variable} v1
   * @param {variable} v2
   * @return {string} html if v1 and v2 are equal
   */
  Handlebars.registerHelper('equals', function(v1, v2, options) {
    if(v1 === v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

});
