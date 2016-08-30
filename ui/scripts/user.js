define(function(require){

  var Backbone = require('backbone');

  var User = Backbone.Model.extend({
    url: function() {
      return this.get('id') ? '/user/' + this.get('id') : '/user';
    }
  });

  return User;
});