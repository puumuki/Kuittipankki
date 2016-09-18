define(function(require) {

  var markdown = require('markdown');
  var Handlebars = require('handlebars');

  /**
   * Handlebar helper that converts input markdown syntax to HTML
   * @param {string} value markdown syntax
   * @return {string} html
   */
  function markdownHelper(value) {
    return markdown.toHTML(value);
  }

  Handlebars.registerHelper('markdown', markdownHelper);

});