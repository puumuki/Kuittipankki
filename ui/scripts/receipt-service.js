define(function(require) {
  
  var ReceiptCollection = require('receipt-collection');
  var Q = require('q');

  var _collection = new ReceiptCollection();

  /**
   * Fetch a receipt from the server or a memory if receipt is allready fetced.
   * Server fetch can be forced by passing options.fetch as a parameter.
   *
   * @param options.fetch {Boolean}
   * @return Q.promise 
   */
  function fetchReceipt( options ) {

    var deferred = Q.defer();

    if( _collection.size() === 0 || options.fetch ) {
      var promise = fetchReceiptCollection();

      promise.then(function(collection) {
        deferred.resolve(collection.get(options.id));
      }).fail(function(error) {
        deferred.reject(error);
      });

    } else {
      deferred.resolve(_collection.get(options.id));
    }

    return deferred.promise;
  }

  /**
   * Mark Receipt object to deleted, after deletion object is removed from the _collection and it's not any more
   * shown in the UI. It's still accessible from server GET /receipt and PUT/receipt methods.
   *
   * @param receipt {Backbone.Receipt}
   * @return Q.promise 
   */
  function deleteReceipt( receipt ) {

    var deferred = Q.defer();

    if( receipt ) {
      receipt.destroy({
        success: function(data) {
          _collection.remove(receipt);
          deferred.resolve(data);
        },
        error: function(error) {
          deferred.reject(error);
        }
      });
    } else {
      deferred.reeject({
        error: "Could not delete receipt"
      });
    }

    return deferred.promise;
  }  

  /**
   * Fetch receipts from the server. If collection is empty receipt are loaded
   * from server else receipts are returned from browsers memory.
   * @param options.fetch {Boolean} forces to fetch collection from server
   * @return Q.promise object
   */
  function fetchReceiptCollection( options ) {

    var options = options || {};

    var deferred = Q.defer();
    
    if( _collection.size() === 0 || options.fetch ) {
      _collection.fetch({
        success: function() {
          deferred.resolve(_collection);
        },
        error: function(error) {
          deferred.reject(error);
        }
      });
    } else {
      deferred.resolve(_collection);
    }

    return deferred.promise;
  } 

  function saveReceipt( receipt ) {
    var id = receipt.get('id');

    if( !id ) {
      _collection.add(receipt);
    }

    var deferred = Q.defer();

    receipt.save(null, {
      success: function(data) {
        deferred.resolve(data);
      },
      error: function(error) {
        console.log(error);
        deferred.reject(error);
      }
    });

    return deferred.promise;
  }

  return {
    fetchReceiptCollection:fetchReceiptCollection,
    fetchReceipt:fetchReceipt,
    saveReceipt:saveReceipt,
    deleteReceipt: deleteReceipt
  };
  
});