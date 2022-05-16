'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Event.belongsTo(models.User, {
        foreignKey: 'UserId',
        as: 'organizer'
      });
      Event.belongsToMany(models.User, { as: 'attendees', through: 'Participation' });
    }
  }
  Event.init({
    UserId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    completed: DataTypes.BOOLEAN,
    is_full_day: DataTypes.BOOLEAN,
    start_time: DataTypes.DATE,
    end_time: DataTypes.DATE,
    latitude: DataTypes.DECIMAL(10, 8),
    longitude: DataTypes.DECIMAL(11, 8),
    placeName: DataTypes.STRING,
    address: DataTypes.STRING,
    url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};