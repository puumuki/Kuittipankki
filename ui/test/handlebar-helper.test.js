define(function(require) {

  var hbs = require('handlebars');
  var handlebarHelpers = require('handlebar-helpers/helpers');
  var _ = require('underscore');

  describe('handlebars helpers.translate() ', function() {

    beforeEach(function() {
      window.currentLanguage = 'fi';
    });

    it('Call directly helpers.translate() function wihtout handlebars', function() {
      expect( handlebarHelpers.translate ).to.be.a('function');
      expect( handlebarHelpers.translate('receipt.purchaced-since', {'fromPurchase':'300'}) ).to.be('Ostettu 300 sitten');
      expect( handlebarHelpers.translate('receipt.price') ).to.be('Tuotteen hinta');
    });

    it('Calling helper.translate() through handlebar template - receipt.purchaced-since', function() {
      var translation = hbs.compile('{{t "receipt.purchaced-since" fromPurchase=price}}')({price:300});
      expect( translation ).to.be('Ostettu 300 sitten');
    });

    it('Calling helper.translate() through handlebar template - receipt.price', function() {
      expect( hbs.compile('{{ t "receipt.price" }}')() ).to.be('Tuotteen hinta');
    });
  });

  describe('helpers.fileUrlHelper()', function() {
    it.skip('TODO', function() {

    });
  });

  describe('helpers.markdownHelper()', function() {
    it.skip('TODO', function() {

    });
  });

  describe('helpers.equals()', function() {
    it.skip('TODO', function() {

    });
  });

  describe('helpers.datetime()', function() {
    it.skip('TODO', function() {

    });
  });

  describe('helpers.datehourminutetime()', function() {
    it.skip('TODO', function() {

    });
  });

});
