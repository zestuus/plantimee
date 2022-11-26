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
      Event.belongsTo(models.Event, {
        foreignKey: 'recurrentEventId',
        as: 'recurrentEvent'
      });
      Event.hasMany(models.Event, { as: 'recurrentInstances', foreignKey: 'recurrentEventId', });
    }
  }
  Event.init({
    UserId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    completed: DataTypes.BOOLEAN,
    isFullDay: DataTypes.BOOLEAN,
    isGuestListPublic: DataTypes.BOOLEAN,
    startTime: DataTypes.DATE,
    endTime: DataTypes.DATE,
    recurrentEventId: DataTypes.INTEGER,
    originalStartTime: DataTypes.DATE,
    repeatEnabled: DataTypes.BOOLEAN,
    repeatFreq: DataTypes.STRING,
    repeatInterval: DataTypes.INTEGER,
    repeatByDay: DataTypes.STRING,
    repeatUntil: DataTypes.DATE,
    repeatCount: DataTypes.STRING,
    latitude: DataTypes.DECIMAL(10, 8),
    longitude: DataTypes.DECIMAL(11, 8),
    placeName: DataTypes.STRING,
    address: DataTypes.STRING,
    url: DataTypes.STRING,
    googleId: DataTypes.STRING,
    googleCalendarId: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};