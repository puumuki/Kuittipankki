define(function(require) {

  var Backbone = require('backbone');
  var sorters = require('../../scripts/sorters');
  var _ = require('underscore');

  var TestModel = Backbone.Model.extend({});

  describe('sorters.alphabeticalSorter()', function() {

    it('It should arrange item in alphabetical order', function() {

      var items = [
        new TestModel({value:'Cee'}),
        new TestModel({value:'bee'}),
        new TestModel({value:'Aa'})
      ];

      var sortedArray = items.sort(sorters.alphabeticalSorter('value'))
      expect( sortedArray ).not.to.be.empty();
      expect( sortedArray[0].get('value') ).to.be('Aa');
      expect( sortedArray[1].get('value') ).to.be('bee');
      expect( sortedArray[2].get('value') ).to.be('Cee');
    });

    it('Function should return a sorting function', function() {
      expect( sorters.alphabeticalSorter('attributeName') ).to.be.a('function');
    });

    it('Function call should throw an Error if attributeName argument is missing', function() {
     expect(function() {
        sorters.alphabeticalSorter();
      }).to.throwError(/Missing parameter attributeName, given values was undefined/);
    });

  });

  describe('sorters.dateTimeSorter()', function() {

    it('It should arrange item in tronological order', function() {

      var items = [
        new TestModel({value:'2018-11-15 12:12:00'}),
        new TestModel({value:'2013-01-15 12:12:00'}),
        new TestModel({value:'2015-10-15 12:12:00'}),
        new TestModel({value:'2017-11-15 12:12:00'})
      ];

      var sortedArray = items.sort(sorters.dateTimeSorter('value'))
      expect( sortedArray ).not.to.be.empty();

      expect( sortedArray[0].get('value') ).to.be('2018-11-15 12:12:00');
      expect( sortedArray[1].get('value') ).to.be('2017-11-15 12:12:00');
      expect( sortedArray[2].get('value') ).to.be('2015-10-15 12:12:00');
      expect( sortedArray[3].get('value') ).to.be('2013-01-15 12:12:00');
    });

    it('Function should return a sorting function', function() {
      expect( sorters.dateTimeSorter('attributeName') ).to.be.a('function');
    });

    it('Function call should throw an Error if attributeName argument is missing', function() {
     expect(function() {
        sorters.dateTimeSorter();
      }).to.throwError(/Missing parameter attributeName, given values was undefined/);
    });

  });

  describe('sorters.dateTimeSorter()', function() {

    it('It should arrange item in tronological order', function() {

      var items = [
        new TestModel({value:'15.11.2018'}),
        new TestModel({value:'15.01.2013'}),
        new TestModel({value:'15.10.2015'}),
        new TestModel({value:'15.11.2017'})
      ];

      var sortedArray = items.sort(sorters.dateSorter('value'))

      expect( sortedArray ).not.to.be.empty();
      expect( sortedArray[0].get('value') ).to.be('15.11.2018');
      expect( sortedArray[1].get('value') ).to.be('15.11.2017');
      expect( sortedArray[2].get('value') ).to.be('15.10.2015');
      expect( sortedArray[3].get('value') ).to.be('15.01.2013');
    });

    it('Function should return a sorting function', function() {
      expect( sorters.dateSorter('attributeName') ).to.be.a('function');
    });

    it('Function call should throw an Error if attributeName argument is missing', function() {
     expect(function() {
        sorters.dateSorter();
      }).to.throwError(/Missing parameter attributeName, given values was undefined/);
    });

  });

});

