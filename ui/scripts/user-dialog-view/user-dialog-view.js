define(function(require) {

  var Backbone      = require('backbone');
  var template      = require('hbs!user-dialog-view/user-dialog');
  var regionManager = require('region-manager');
  var userService   = require('services/user-service');
  var Communicator  = require('communicator');

  var UserDialogView = Backbone.Marionette.ItemView.extend({

    template: template,

    events : {
      'click button[name="close"]' : 'closeDialog',
      'click button.save' : 'save',
      'click button.lang' : '_changeLanguage'
    },

    initialize: function() {
      this._user = userService.getAuthenticatedUser();
      regionManager.getRegion('dialog').show(this);
      console.log( !!this._user );
    },

    _onCancelClick: function(event) {
      event.preventDefault();
    },

    _changeLanguage: function(e) {
      var language = $(e.currentTarget).data('lang');

      console.info("Updating user's language to ", language);

      this._user.set('lang', language );

      window.currentLanguage = language;
      Communicator.mediator.trigger('language:change', language);

      this.$el.find('.lang').each(function(index, className, state) {
        $(this).toggleClass('btn-primary', $(this).data('lang') === language);
      });

    },

    save: function() {
      this._user.save();
      this.closeDialog();
    },

    closeDialog: function() {
      //Close modal
      this.$el.find('.modal').modal('hide');

      //Bootstrap won't support multiple open modals,
      //at this point we had open this and ConfirmationDialogView,
      //so it counts as multiple dialogs. This is how we just clean up
      //the modal backdrop.
      $('.modal-backdrop').remove();
    },

    serializeData: function() {
      console.log( this._user.toJSON() );
      return {
        en: this._user.get('lang') === 'en',
        fi: this._user.get('lang') === 'fi'
      };
    },

    render: function() {
      UserDialogView.__super__.render.call(this);
      this.$el.find('.modal').modal();
    }
  });

  return UserDialogView;
});
