define(function(require) {

  var moment = require('momentjs');

  /**
   * Return sorter function user as BackboneCollection.sort function.
   * @param attributeName {String}
   * @return {Function} sorter function
   */
  var alphabeticalSorter = function(attributeName) {
    return function(a,b){

      var aValue = a.get(attributeName) ? a.get(attributeName).toLowerCase() : "";
      var bValue = b.get(attributeName) ? b.get(attributeName).toLowerCase() : "";

      var order = 0;

      if(aValue > bValue) {
        order = 1;
      } else if(aValue < bValue) {
        order = -1;
      }

      return this.reverse ? -(order) : order;
    };      
  };

  var dateSorter = function(attributeName) {
    return function(a,b){

      var format = 'MM.DD.YYYY';

      var aValue = moment(  a.get(attributeName) ? a.get(attributeName) : "", format);
      var bValue = moment(  b.get(attributeName) ? b.get(attributeName) : "", format)

      var order = 0;

      if(aValue.isBefore(bValue)) {
        order = 1;
      } else if(aValue.isAfter(bValue)) {
        order = -1;
      }

      return this.reverse ? -(order) : order;
    };    
  };

  return {
    alphabeticalSorter: alphabeticalSorter,
    dateSorter: dateSorter
  };
});