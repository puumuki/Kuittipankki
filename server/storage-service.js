var Store          = require('jfs');
var path           = require('path');
var settings       = require('./settings');

/**
 * User storage can be used to get access to all user data, hash, names and etch.
 */
var _userStoragePath = path.join( settings.data_directory ,'users.json');
var _userStorage = new Store(_userStoragePath, {saveId:true});

/**
 * Receipt storage give you access to receipt JSON objects
 */
var _userStoragePath = path.join( settings.data_directory ,'receipts.json');
var _receiptStorage = new Store(_userStoragePath, {saveId:true});

/**
 * Uploaded files meta data storage, it hold information about orginal file names and other file information.
 */
var _fileMetaDataStoragePath = path.join( settings.data_directory ,'file-meta.json');
var _fileMetaDataStorage = new Store(_fileMetaDataStoragePath, {saveId:true});

module.exports = {
  userStorage: _userStorage,
  receiptStorage: _receiptStorage,
  fileMetaDataStorage: _fileMetaDataStorage
};