define(function(require){

  var Backbone = require('backbone');

  /**
   * File model class
   * @class {Backbone.Model}
   */
  var File = Backbone.Model.extend({

    idAttribute: 'fileId',

    url: function() {
      return this.get('fileId') ? '/file/' + this.get('fileId') : '/file';
    }
  });

  return File;
});
