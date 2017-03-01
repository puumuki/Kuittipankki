define(function(require) {

  var languages = {
    fi: require('localization/fi'),
    en: require('localization/en')
  };

  function getLocalizations( lang ) {
    return languages[ lang ];
  }

  return {
    languages: languages,
    getLocalizations: getLocalizations
  };

});
