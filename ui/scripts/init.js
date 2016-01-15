require.config({

  

  /* starting point for application */
  deps: [
    'backbone.marionette', 
    'bootstrap', 
    'bootstraptagsinput',
    'backbone_bootstrap_modal',
    'dropzone', 
    'main'
  ],


  shim: {
    bootstraptagsinput: {
      deps: ['jquery','bootstrap'],
      exports: 'bootstraptagsinput'
    },
    backbone: {
      deps: [
        'underscore',
        'jquery'
      ],
      exports: 'Backbone'
    },
    bootstrap: {
      deps: ['jquery', 'jqueryui'],
      exports: 'jquery'
    }
  },

  paths: {
    q:'../bower_components/q/q',

    dropzone: '../bower_components/dropzone/dist/dropzone',

    momentjs: '../bower_components/momentjs/min/moment.min',

    jquery: '../bower_components/jquery/dist/jquery.min',      

    jqueryui: '../bower_components/jquery-ui/jquery-ui',

    backbone: '../bower_components/backbone-amd/backbone',
    underscore: '../bower_components/underscore-amd/underscore',

    bootstrap: 'bower_components/bootstrap/dist/js/bootstrap.js',

    bootstraptagsinput: '../bower_components/bootstrap-tagsinput/dist/bootstrap-tagsinput.min',

    /* alias all marionette libs */
    'backbone.marionette': '../bower_components/backbone.marionette/lib/core/amd/backbone.marionette',
    'backbone.wreqr': '../bower_components/backbone.wreqr/lib/amd/backbone.wreqr',
    'backbone.babysitter': '../bower_components/backbone.babysitter/lib/amd/backbone.babysitter',

    /* alias the bootstrap js lib */
    bootstrap: 'vendor/bootstrap',

    /* Alias text.js for template loading and shortcut the templates dir to tmpl */
    text: '../bower_components/requirejs-text/text',
    tmpl: "../templates",

    /* handlebars from the require handlerbars plugin below */
    handlebars: '../bower_components/require-handlebars-plugin/Handlebars',

    /* require handlebars plugin - Alex Sexton */
    i18nprecompile: '../bower_components/require-handlebars-plugin/hbs/i18nprecompile',
    json2: '../bower_components/require-handlebars-plugin/hbs/json2',
    hbs: '../bower_components/require-handlebars-plugin/hbs',

    bootstrapdialog: '../bower_components/backbone.bootstrap-modal/index.js'
  },

  hbs: {
    disableI18n: true
  }
});
