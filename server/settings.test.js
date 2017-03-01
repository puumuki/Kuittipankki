var path = require('path');

/**
 * Kuittipankki settings
 */
var settings = {

  port: 9090,

  env: 'test',

  logging: {
    level: 'error',
    filename: 'kuittipankki.test.log'
  },

  /**
   * Minified UI location
   */
  //ui_path: path.join(__dirname,'..', 'ui','build')

  /**
   * UI location
   */
  ui_path: path.join(__dirname,'..', 'ui'),

  /**
   * Data directory
   */
  data_directory: path.join(__dirname, 'test', 'data' ),

  /**
   * Uploaded files
   */
  upload_directory: path.join(__dirname, 'test', 'uploaded-files'),

  /**
   * Log directory
   */
  log_directory: path.join(__dirname, 'test', 'logs')
};

module.exports = settings;
