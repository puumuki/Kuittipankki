define(function(require) {
  
  var ReceiptCollection = require('receipt-collection');
  var Q = require('q');
  var communicator = require('communicator');
  var Fuse = require('fuse');
  var _collection = new ReceiptCollection();

  communicator.mediator.on('app:user:logout', function() {
    _collection.reset(null);//Clear receipt in memory after logout
  });

  /**
   * Fetch a receipt from the server or a memory if receipt is allready fetced.
   * Server fetch can be forced by passing options.fetch as a parameter.
   *
   * @param {Boolean} options.fetch 
   * @return {Q.promise} promise object
   */
  function fetchReceipt( options ) {

    var deferred = Q.defer();

    if( _collection.size() === 0 || options.fetch ) {
      var promise = fetchReceiptCollection();

      promise.then(function(collection) {
        var receipt = collection.get(options.id);
        if( receipt ) {
          deferred.resolve(receipt);  
        } else {
          deferred.reject({ message: 'Receipt not found' });
        }
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
   * @return {Q.promise} promise object
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
        error: 'Could not delete receipt'
      });
    }

    return deferred.promise;
  }  

  /**
   * Fetch receipts from the server. If collection is empty receipt are loaded
   * from server else receipts are returned from browsers memory.
   * @param options.fetch {Boolean} forces to fetch collection from server
   * @return {Q.promise} object
   */
  function fetchReceiptCollection( options ) {

    var ops = options || {};

    var deferred = Q.defer();
    
    if( _collection.size() === 0 || ops.fetch ) {
      _collection.fetch({
        success: function() {
          deferred.resolve(_collection);
        },
        error: function(error,res) {
          deferred.reject({error: error, res: res});
        }
      });
    } else {
      deferred.resolve(_collection);
    }

    return deferred.promise;
  } 

  /**
   * Saves receipt to server
   * @param {Backbone.Receipt} receipt
   * @return {Q.promise} promise object
   */
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
  
  /**
   * Search receipts from browser memory, from the _collection object. 
   * @param {String} search string
   * @param {ReceiptCollection} found receipts
   */
  function searchReceipts( search ) {
    var data = _collection.toJSON();
    
    var keys = ['description','name', 'tags',
                'pictures','purchaseDate',
                'registered','store'];

    var fuse = new Fuse(data, {
      caseSensitive: false,
      includeScore: false,
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      keys: keys
    });

    return new ReceiptCollection( fuse.search( search ) );
  }

  /**
   * Return internal collection
   * @return {ReceiptCollection} receipt collection
   */
  function getReceiptCollection() {
    return _collection;
  }

  return {
    getReceiptCollection: getReceiptCollection,
    fetchReceiptCollection:fetchReceiptCollection,
    fetchReceipt:fetchReceipt,
    saveReceipt:saveReceipt,
    deleteReceipt: deleteReceipt,
    searchReceipts: searchReceipts
  };
  
});