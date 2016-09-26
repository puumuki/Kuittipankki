var path = require('path');

/**
 * Kuittipankki settings
 */
var settings = {

  port: 9090,

  env: 'development',

  logging: {
    level: 'debug',
    filename: 'kuittipankki.log'
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
  data_directory: path.join(__dirname, 'data' ),

  /**
   * Uploaded files
   */
  upload_directory: path.join(__dirname, 'uploaded-files')
};

module.exports = settings;