define(function(require) {
  
  var Backbone = require('backbone');
  var template = require('hbs!loading-view/loading');

  var LoadingView = Backbone.Marionette.ItemView.extend({

    template: template

  });


  return LoadingView;

});