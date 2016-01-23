define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!tmpl/404'); 

  var PageNogFoundView = Backbone.Marionette.ItemView.extend({

    template: template,

  });

  return PageNogFoundView;
});