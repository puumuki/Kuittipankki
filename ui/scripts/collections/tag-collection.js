define(function(require) {
  var Backbone = require('backbone');
  var Tag = require('models/tag');

  var TagCollection = Backbone.Collection.extend({
      url: '/tags',
      model: Tag
  });

  return TagCollection;
});
