define(function(require){

  var Backbone = require('backbone');

  var Receipt = Backbone.Model.extend({
    url: function() {
      return this.get("id") ? "/receipt/" + this.get("id") : "/receipt";
    } 
  });

  return Receipt;
});