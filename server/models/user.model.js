"use strict";

module.exports = function(sequelize, DataTypes) {

  var User = sequelize.define('User',{
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lang: {
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
    tableName: 'user',
  });

  User.prototype.toJSON = function() {
    return {
      userId: this.user_id,
      username: this.username,
      lang: this.lang ? this.lang : 'fi'
    };
  }

  User.associate = function(models) {
    User.hasMany(models.Receipt, {as:'receipt', foreignKey: 'user_id'});
  }

  return User;
};
