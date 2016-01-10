define(function(require) {
  var Q = require('q');
  var Communicator = require('communicator');

  /**
   * Currently authenticated user
   */
  var _authenticatedUser = null;

  /**
   * Authenticate user at the server
   * @param username {String}
   * @param password {String}
   * @return Q.promise
   */
  function authenticate(username, password) {
    
    var deferred = Q.defer();

    $.ajax({
      url: '/login',
      type: 'post',
      data: { username: username, password: password },
      success: function(user) {
        _authenticatedUser = user;
        Communicator.mediator.trigger("app:user:authenticated", user);
        deferred.resolve(user);
      },
      error: function(error) {
        deferred.reject(error);
      }
    });

    return deferred.promise;
  }

  /**
   * Fetch currently authenticated user from server, 
   * it user is not authenticated nothing is returned.
   * @return Q.promise
   */
  function fetchAuthenticatedUser() {
    var deferred = Q.defer();

    $.ajax({
      url: '/userauthenticated',
      type: 'get',
      success: function(user) {
        _authenticatedUser = user;
        deferred.resolve(user);
      },
      error: function(error) {
        deferred.reject(error);
      }
    });

    return deferred.promise;
  }

  /**
   * End user session
   * @return Q.promise
   */
  function logout() {
    var deferred = Q.defer();

    $.ajax({
      url: '/logout',
      type: 'get',
      success: function(data) {
        _authenticatedUser=null;
        Communicator.mediator.trigger("app:user:logout");
        deferred.resolve(data);
      },
      error: function(error) {
        deferred.reject(error);
      }
    });

    return deferred.promise;    
  }

  function getAuthenticatedUser() {
    return _authenticatedUser;
  }

  return {
    logout:logout,
    authenticate:authenticate,
    fetchAuthenticatedUser:fetchAuthenticatedUser,
    getAuthenticatedUser:getAuthenticatedUser
  };

});