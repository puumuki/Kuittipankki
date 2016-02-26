define(function(require) {

	var Backbone = require('backbone');
	var template = require('hbs!user-edit-dialog-view/user-edit-dialog');

  var regionManager = require('region-manager');

	var UserEditViewDialog = Backbone.Marionette.ItemView.extend({

		template: template,

    initialize: function() {
      regionManager.getRegion('dialog').show(this);
    },

    serializeData: function() {
    	return {};
    },

    render: function() {
      UserEditViewDialog.__super__.render.call(this);
      this.$el.find('.modal').modal();
    }

	});

	return UserEditViewDialog;

});