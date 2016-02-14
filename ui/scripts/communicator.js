define([
  'backbone',
  'backbone.marionette'
],
function( Backbone ) {

  var Communicator = Backbone.Marionette.Controller.extend({
    initialize: function() {
      console.log('initialize a Communicator');

      // create a pub sub
      this.mediator = new Backbone.Wreqr.EventAggregator();

      //create a req/res
      this.reqres = new Backbone.Wreqr.RequestResponse();

      // create commands
      this.command = new Backbone.Wreqr.Commands();
    }
  });

  var _communicator = null;

  function _getInstance() {
    if(!_communicator) {
      _communicator = new Communicator();
    }
    return _communicator;
  }

  return _getInstance();
});
