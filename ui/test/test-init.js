require.config({

  waitSeconds: 0,

  baseUrl: '../scripts/',

  /* starting point for application */
  deps: [
    'backbone',
    'backbone.marionette',
    'bootstrap',
    'bootstraptagsinput',
    'dropzone',
    'moment',
    'expect'
  ],

  shim: {
    backbone: {
      deps: [
        'underscore',
        'jquery'
      ],
      exports: 'Backbone'
    },
    bootstraptagsinput: {
      deps: ['jquery','bootstrap'],
      exports: 'bootstraptagsinput'
    },

    'backbone.marionette': {
      deps: ['backbone'],
      exports: 'Marionette'
    },

    bootstrap: {
      deps: ['jquery', 'jqueryui'],
      exports: 'jquery'
    },

    markdown: {
      exports: 'markdown'
    }
  },

  paths: {

    mocha: '../libs/mocha',
    expect: '../libs/expect',

    q:'../bower_components/q/q',

    dropzone: '../bower_components/dropzone/dist/dropzone',

   'moment-duration-format' : 'vendor/moment-duration-format',

    moment: '../bower_components/momentjs/min/moment.min',

    jquery: '../bower_components/jquery/dist/jquery.min',

    jqueryui: '../bower_components/jquery-ui/jquery-ui.min',

    backbone: '../bower_components/backbone-amd/backbone',
    underscore: '../bower_components/underscore-amd/underscore',

    bootstrap: '../bower_components/bootstrap/dist/js/bootstrap.min',

    bootstraptagsinput: '../bower_components/bootstrap-tagsinput/dist/bootstrap-tagsinput.min',

    /* alias all marionette libs */
    'backbone.marionette': '../bower_components/backbone.marionette/lib/core/amd/backbone.marionette',
    'backbone.wreqr': '../bower_components/backbone.wreqr/lib/amd/backbone.wreqr',
    'backbone.babysitter': '../bower_components/backbone.babysitter/lib/amd/backbone.babysitter',

    /* Alias text.js for template loading and shortcut the templates dir to tmpl */
    text: '../bower_components/requirejs-text/text',
    tmpl: '../templates',

    /* handlebars from the require handlerbars plugin below */
    handlebars: '../bower_components/require-handlebars-plugin/Handlebars',

    markdown: '../bower_components/markdown/lib/markdown',

    /* require handlebars plugin - Alex Sexton */
    i18nprecompile: '../bower_components/require-handlebars-plugin/hbs/i18nprecompile',
    json2: '../bower_components/require-handlebars-plugin/hbs/json2',
    hbs: '../bower_components/require-handlebars-plugin/hbs',

    //Fuse is a full JavaScript fuzzy-search implementation that searches accross the keys of every record in a list.
    fuse: '../bower_components/fuse.js/src/fuse'
  },

  hbs: {
    disableI18n: true,
    disableHelpers: true,
  }
});

define(function(require) {

  var mocha = require('mocha');
  var $ = require('jquery');

  mocha.setup('bdd');

  require([

    '../test/handlebar-helper.test',
    '../test/sorter.test'
  ], function(require) {
    mocha.run();
  });

});


