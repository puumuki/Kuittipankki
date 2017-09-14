"use strict";

const objectService = require('../object-service');

module.exports = function(sequelize, DataTypes) {

  var Receipt = sequelize.define('Receipt', {

    receipt_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
    },
    store: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    price: {
      type: DataTypes.STRING
    },
    purchase_date: {
      type: DataTypes.DATE
    },
    warrantly_end_date: {
      type: DataTypes.DATE
    },
    purchase_date: {
      type: DataTypes.DATE
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
    tableName: 'receipt',
  });

  Receipt.prototype.toJSON = function() {
    var json = sequelize.Model.prototype.toJSON.apply( this );
    return objectService.camelizeObject( json );
  }

  Receipt.associate = function(models) {
    Receipt.hasMany(models.Tag, {as: 'tags', foreignKey: 'receipt_id'});
    Receipt.hasMany(models.File, {as:'files', foreignKey: 'receipt_id'});
  }

  return Receipt;
};
