define(function(require){

  var Backbone = require('backbone');

  /**
   * User model class
   * @class {Backbone.Model}
   */
  var User = Backbone.Model.extend({
    url: function() {
      return this.get('id') ? '/user/' + this.get('id') : '/user';
    }
  });

  return User;
});
