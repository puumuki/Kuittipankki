define(function(require) {

  var Q = require('q');

  /**
   * Delete picture from server
   */
  function deletePicture( picture ) {
    var deferred = Q.defer();

    $.ajax({
      url: '/picture/' + picture,
      type: 'delete',
      data: { picture: picture },
      success: function(data) {
        deferred.resolve(data);
      },
      error: function(error) {
        deferred.reject(error);
      }
    });

    return deferred.promise;
  }

  return {
    deletePicture: deletePicture
  };
});