define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!empty-view/empty');

  var EmptyView = Backbone.Marionette.ItemView.extend({
    template: template,
  });

  return EmptyView;
});
