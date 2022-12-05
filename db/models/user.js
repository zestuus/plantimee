'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Event, { as: 'own_events' });
      User.belongsToMany(models.Event, { as: 'events', through: 'Participation' });
    }
  }
  User.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    mfa: DataTypes.STRING,
    full_name: DataTypes.STRING,
    email: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    address: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};