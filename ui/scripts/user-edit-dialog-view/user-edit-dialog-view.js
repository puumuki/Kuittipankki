define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!user-edit-dialog-view/user-edit-dialog');

  var regionManager = require('region-manager');

  var UserEditViewDialog = Backbone.Marionette.ItemView.extend({

    template: template,

    initialize: function() {
      UserEditViewDialog.__super__.initialize.call(this);
      console.log(this.options);
      regionManager.getRegion('dialog').show(this);
    },

    serializeData: function() {
      return this.model.toJSON();
    },

    render: function() {
      UserEditViewDialog.__super__.render.call(this);
      this.$el.find('.modal').modal();
    }

  });

  return UserEditViewDialog;

});