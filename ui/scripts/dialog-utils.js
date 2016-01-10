define(function(require) {
  
  var Backbone = require('backbone');

  var YesOrNoDialogView = Backbone.View.extend({
      initialize: function () {
          this.bind("ok", okClicked);
      },

      okClicked: function (modal) {
          alert("Ok was clicked");
          modal.preventClose();
      }
  });

  var view = new YesOrNoDialogView();

  var modal = new Backbone.BootstrapModal({ content: view }).open();

});