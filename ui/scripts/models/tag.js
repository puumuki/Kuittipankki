define(function(require){

  var Backbone = require('backbone');

  /**
   * Tag model class
   * @class {Backbone.Model}
   */
  var Tag = Backbone.Model.extend({

    idAttribute: 'tagId',

    url: function() {
      return this.get('tagId') ? '/tag/' + this.get('tagId') : '/tag';
    }
  });

  return Tag;
});
