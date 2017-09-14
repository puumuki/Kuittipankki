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
    it('Test forming URL for image file', function() {

      var fileObject = {
        mimetype: 'image/png',
        filename: 'asdf'
      };

      var result = handlebarHelpers.fileUrlHelper( fileObject );
      expect( result.string ).to.be( '#files/asdf' );

    });

    it('Test forming URL for a file', function() {
      var fileObject = {
        mimetype: 'application/json',
        filename: 'test.json'
      };

      var result = handlebarHelpers.fileUrlHelper( fileObject );
      expect( typeof result ).to.be( "object" );
      expect( typeof result.string ).to.be( "string" );
      expect( result.string ).to.be( 'files/test.json' );
    });

  });

  describe('helpers.equals()', function() {
    it('non equal strings', function() {

      var data = { result: null };

      var options = {
        inverse: function() {
          data.result = 'inverse';
        },
        fn: function() {
          data.result = 'fn';
        }
      }

      var result = handlebarHelpers.equals( "laa", "laa2",  options);
      expect( typeof data.result ).to.be( "string" );
      expect( data.result ).to.be( "inverse" );
    });

    it('equal strings', function() {

      var data = { result: null };

      var options = {
        inverse: function() {
          data.result = 'inverse';
        },
        fn: function() {
          data.result = 'fn';
        }
      }

      var result = handlebarHelpers.equals( "laa", "laa",  options);
      expect( typeof data.result ).to.be( "string" );
      expect( data.result ).to.be( "fn" );
    });
  });

  describe('helpers.datetime()', function() {
    it('Test converting Date object to formatted datetime string', function() {
      var result = handlebarHelpers.dateTimeHelper( new Date("1995-12-17T03:24:00") );
      expect( typeof result ).to.be( 'object' );
      expect( result.string ).to.be( '17.12.1995 03:24' );
    });

    it('Test converting null to formatted string datetime', function() {
      var result = handlebarHelpers.dateTimeHelper( null );
      expect( result ).to.be( '' );
    });

  });

});
