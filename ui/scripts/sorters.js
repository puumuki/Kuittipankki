define(function(require) {

  var moment = require('moment');

  /**
   * Return sorter function user as BackboneCollection.sort function.
   * @param {String} attributeName, that is used sorting Backbone.Collection
   * @return {Function} sorter function
   */
  var alphabeticalSorter = function(attributeName) {

    if( !attributeName ) {
      throw new Error("Missing parameter attributeName, given values was " + attributeName);
    }

    return function(a,b){

      var aValue = a.get(attributeName) ? a.get(attributeName).toLowerCase() : '';
      var bValue = b.get(attributeName) ? b.get(attributeName).toLowerCase() : '';

      var order = 0;

      if(aValue > bValue) {
        order = 1;
      } else if(aValue < bValue) {
        order = -1;
      }

      return this.reverse ? -(order) : order;
    };
  };

  /**
   * Return date sorter function user as BackboneCollection.sort function.
   * @param {String} attributeName
   * @param {string} dateFormat, moment.js format
   * @return {Function} sorter function
   */
  var dateSorter = function(attributeName, dateFormat) {

    if( !attributeName ) {
      throw new Error("Missing parameter attributeName, given values was " + attributeName);
    }

    var format = dateFormat ? dateFormat : 'DD.MM.YYYY';

    return function(a,b){

      var aValue = moment(  a.get(attributeName) ? a.get(attributeName) : '', format);
      var bValue = moment(  b.get(attributeName) ? b.get(attributeName) : '', format);

      var order = 0;

      if(aValue.isBefore(bValue)) {
        order = 1;
      } else if(aValue.isAfter(bValue)) {
        order = -1;
      }

      return this.reverse ? -(order) : order;
    };
  };

  /**
   * Return date time sorter function user as BackboneCollection.sort function.
   * @param attributeName {String}
   * @return {Function} sorter function
   */
  var dateTimeSorter = function(attributeName) {
    return dateSorter(attributeName, 'YYYY-MM-DD hh:mm:ss');
  };

  return {
    alphabeticalSorter: alphabeticalSorter,
    dateSorter: dateSorter,
    dateTimeSorter:dateTimeSorter
  };
});
