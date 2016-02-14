define(function(require) {

  return {
    fadeIn: function(view) {
      this.$el.hide();
      this.$el.html(view.el);
      this.$el.fadeIn("slow");
    }
  };

});