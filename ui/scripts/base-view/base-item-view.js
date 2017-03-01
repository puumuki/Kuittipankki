define(function(require) {

  var Communicator = require('communicator');
  var _ = require('underscore');
  var Backbone = require('backbone');

  /**
   * BaseItemView for a extended application wide event support.
   * Pros using this class is that you have a centralized way to manage event bindings,
   * bindings are automatically unbind when a view is destroyed if an event is binded by using bindListener method.
   *
   * If you implement onClose function in extending class remember call BaseItemView.__super__.onClose.call(this),
   * otherwise event are not unbind!
   *
   * In your extending class you have to also call BaseItemView constructor seperatly.
   * Like <EXTENDING_VIEW>.__super__.initialize.call(this);
   */
  var BaseItemView = Backbone.Marionette.ItemView.extend({

    initialize: function(){
      BaseItemView.__super__.initialize.call(this);
      this._bindings = [];
      this.bindListener( 'language:change', this.render, this );
    },

    /**
     * Bind an event listener to a event channel. These are application wide events.
     * @param {string} channel, event channel that is being listened
     * @param {function} listener
     * @param {object} context where listener function is called when event occurs
     */
    bindListener: function( channel, listener, context ) {
      var _context = context ? context : this;
      var _binding = Communicator.mediator.on( channel,_.bind( listener, _context ));
      this._bindings.push( _binding );
      return _binding;
    },

    /**
     * Unbind event listener. Give a binding object as a parameter that bindListener() method returns when
     * a event listener is attached.
     * @param {object} binding
     */
    unbindListener: function( binding ) {
      Communicator.mediator.off( binding );
    },

    /**
     * Called when a BaseItemView is closed. Removed are event listeners before view is closed.
     */
    onClose: function() {

      if( !this._bindings ) {
        throw Error('this._bindings are not initialized, this can because BaseItemView constuctor '+
                    'is not called when initializing extending this BaseItemView\n' +
                    'In initialize method call: <EXTENDING_VIEW>.__super__.initialize.call(this);');
      }

      this._bindings.forEach(function( binding ) {
        Communicator.mediator.off(binding);
      }, this);
    }
  });

  return BaseItemView;

});
