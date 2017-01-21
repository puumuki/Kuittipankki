define(function(require) {

  var Backbone = require('backbone');
  var ReceiptCollection = require('receipt-collection');
  var template = require('hbs!report-view/report');

  var _ = require('underscore');

  var effectService = require('services/effect-service');

  var ReportView = Backbone.Marionette.ItemView.extend({

    attachView: effectService.fadeIn,

    template: template,

    events: {
      'click .exportJSON': '_exportJSON'
    },

    exportCSV: function() {
      var separator = ';';

      var keys = ['user_id','id','name','description','store','warrantlyEndDate' +
                   'registered','tags','purchaseDate','description' +
                   'price','files'];

      var header = keys.join(separator);

      var values = '';

      this.collection.each(function(receipt) {
        keys.forEach(function(key) {
          if( key === 'tags ') {
            values += receipt.get(key) && receipt.get(key).join(',');
          } else if( key === 'files') {
            var files = receipt.get(key) && receipt.get(key);
            values += _.map( files, function(file) { return file.filename; } ).join(',');
          } else {
            var value = receipt.get(key);
            values +=  value && value || '';
          }
          values += separator;
        });

        values += '\n';
      });

      return header + '\n' + values;
    },

    serializeData: function() {

      this.options.collection.comparator = _.bind(
        ReceiptCollection.sorters.name,
        {reverse: true}
      );

      this.collection.sort();

      var exportCSV = encodeURIComponent(this.exportCSV());
      var exportJSON = encodeURIComponent(JSON.stringify(this.options.collection.toJSON()));

      return _.extend(ReportView.__super__.serializeData.call(this), {
        receipts: this.options.collection.toJSON(),
        count: this.options.collection.size(),
        exportCSV: 'text/csv;charset=utf-8,' + exportCSV,
        exportJSON: 'text/json;charset=utf-8,' + exportJSON
      });
    },

    render: function() {
      ReportView.__super__.render.apply(this, arguments);
      return this;
    }
  });


  return ReportView;
});
