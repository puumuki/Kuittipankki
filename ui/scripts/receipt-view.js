define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!tmpl/receipt');
  var receiptService = require('receipt-service');
  var userService = require('user-service');
  var _ = require('underscore');
  var communicator = require('communicator');

  var ReceiptView = Backbone.Marionette.ItemView.extend({

    template: template,

    events: {
      'click button[name="delete"]' : '_deleteReceipt'
    },

    initialize: function() {
      communicator.mediator.on('app:user:logout', _.bind(this.render, this));
    },

    _deleteReceipt: function() {
      var promise = receiptService.deleteReceipt(this.model);

      promise.then(function(data) {
        App.router.navigate("#", {trigger:true});
      }).fail(function(error) {
        console.error(error);
        //TODO: Make error handling
      });
    },

    serializeData: function() {
      return _.extend(ReceiptView.__super__.serializeData.call(this), {
        readonly: !userService.getAuthenticatedUser()
      });
    },

    render: function() {
      ReceiptView.__super__.render.apply(this, arguments);
      return this;
    }

  });

  return ReceiptView;
});