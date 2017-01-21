define(function(require) {

  var Q = require('q');

  /**
   * Delete picture from server
   * @param {string} picture name
   * @return {Q.promise} promise is resolved when a picture is deleted
   *                     or rejected when an error is encountered.
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
