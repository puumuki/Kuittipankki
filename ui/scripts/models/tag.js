define(function(require){

  var Backbone = require('backbone');

  /**
   * User model class
   * @class {Backbone.Model}
   */
  var User = Backbone.Model.extend({

    idAttribute: 'tagId',

    url: function() {
      return this.get('tagId') ? '/tag/' + this.get('tagId') : '/tag';
    }
  });

  return User;
});
