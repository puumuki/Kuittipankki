define(function(require) {

  var hbs = require('handlebars');
  var localization = require('localization/localization-service');
  var markdown = require('markdown');
  var moment = require('moment');
  var _ = require('underscore');

  /**
   * Translation helper
   * @param {string} key, tranlations key
   * @param {arguments}
   */
  function translate( value ) {
    var args = Array.from(arguments);

    //currentLanguage to a session object
    var currentLanguage = window.currentLanguage ? window.currentLanguage : 'fi';
    var lang = localization.languages[ currentLanguage ].lang;

    var translation = value in lang ? lang[value] : "'"+ value +"' is missing";

    var translationObject = null;

    if( _.isEmpty( args[args.length-1]) || args.length === 1 ) {
      return translation;
    }
    else if( !_.isEmpty( args[args.length-1].hash) ) {
      translationObject = args[args.length-1].hash;
    }
    else if( _.isObject( args[args.length-1] ) ) {
      translationObject = args[args.length-1];
    }

    if( translationObject ) {
      return hbs.compile( translation )( translationObject );
    }


  }

  /**
   * TODO
   */
  function dateTimeHelper(value, format) {
    if( moment(value).isValid() ) {
      return new hbs.SafeString(moment(value).format('DD.MM.YYYY HH:mm'));
    } else {
      return '';
    }
  }

  /**
   * TODO
   */
  function fileUrlHelper( fileObject ) {

    if( fileObject.mimetype.includes('image') ) {
      return new hbs.SafeString('#files/'+ fileObject.filename);
    } else {
      return new hbs.SafeString('files/'+ fileObject.filename);
    }
  }

  /**
   * Handlebar helper that converts input markdown syntax to HTML
   * @param {string} value markdown syntax
   * @return {string} html
   */
  function markdownHelper(value) {
    var text = value || '';
    return markdown.toHTML(text);
  }

  /**
   * Handlebar helper that work like if statement but can compare two values
   * @param {variable} v1
   * @param {variable} v2
   * @return {string} html if v1 and v2 are equal
   */
  function equals(v1, v2, options) {
    if(v1 === v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  }


  hbs.registerHelper('equals', equals);
  hbs.registerHelper('datetime', dateTimeHelper);
  hbs.registerHelper('datehourminutetime', dateTimeHelper);
  hbs.registerHelper('fileurl', fileUrlHelper);
  hbs.registerHelper('markdown', markdownHelper);
  hbs.registerHelper('translate', translate);
  hbs.registerHelper('t', translate);

  /**
   * Expose function outside, these functions can be used in some cases outside handlebars templates :).
   */
  return {
    translate: translate,
    markdownHelper: markdownHelper
  };

});
