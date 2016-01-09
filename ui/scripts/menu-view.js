define(function(require) {

  var Backbone = require('backbone');
  var template = require('hbs!tmpl/menu')

  var RecipeListView = Backbone.Marionette.ItemView.extend({

    template: template,

    initialize: function(){
    
    }

  });

  return RecipeListView;
});