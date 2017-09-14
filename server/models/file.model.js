"use strict";

const objectService = require('../object-service');

module.exports = function(sequelize, DataTypes) {

  var File = sequelize.define('File',{
    file_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    receipt_id: {
      type: DataTypes.INTEGER
    },
    user_id: {
      type: DataTypes.INTEGER
    },
    filename: {
      type: DataTypes.STRING
    },
    thumbnail: {
      type: DataTypes.STRING
    },
    mimetype: {
      type: DataTypes.STRING
    },
    size: {
      type: DataTypes.INTEGER
    },
    removed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: false
    },
    updated_on: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    timestamps: false,
    tableName: 'file'
  });

  File.findTag = function( fileId ) {
    return this.findOne({
      where: {
        file_id: fileId,
        removed: false
      }
    });
  };

  File.prototype.toJSON = function() {
    var json = sequelize.Model.prototype.toJSON.apply( this );
    return objectService.camelizeObject( json );
  }

  File.associate = function(models) {
    File.hasOne(models.Receipt, {as:'receipt', foreignKey: 'receipt_id'});
  }

  return File;
};
