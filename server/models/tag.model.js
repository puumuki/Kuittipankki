"use strict";

const objectService = require('../object-service');

module.exports = function(sequelize, DataTypes) {

  var Tag = sequelize.define('Tag',{
    tag_id : {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    receipt_id: {
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING
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
    tableName: 'tag'
  });

  Tag.prototype.toJSON = function() {
    var json = sequelize.Model.prototype.toJSON.apply( this );
    return objectService.camelizeObject( json );
  }

  Tag.findTag = function( tagId ) {
    return this.findOne({
      where: {
        tag_id: tagId,
        removed: false
      }
    });
  };

  Tag.associate = function(models) {
    Tag.hasOne(models.Receipt, {as: 'receipt', foreignKey: 'receipt_id'});
  }

  return Tag;
};
