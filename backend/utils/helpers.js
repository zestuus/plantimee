const { EnglishDays } = require("../constants/config");
const getDayBounds = (date = new Date()) => {
  const dayStart = new Date(date);
  dayStart.setHours(0)
  dayStart.setMinutes(0)
  dayStart.setSeconds(0)
  dayStart.setMilliseconds(0)
  const dayEnd = new Date(date);
  dayEnd.setHours(23)
  dayEnd.setMinutes(59)
  dayEnd.setSeconds(0)
  dayEnd.setMilliseconds(0)

  return { dayStart, dayEnd };
}

const getEventInstance = (event, startTime, endTime, attendees, extraFields) => ({
  ...extraFields,
  recurrentEventId: event.id,
  startTime,
  endTime,
  attendees,
  name: event.name,
  description: event.description,
  completed: event.completed,
  isFullDay: event.isFullDay,
  isGuestListPublic: event.isGuestListPublic,
  repeatEnabled: event.repeatEnabled,
  repeatFreq: event.repeatFreq,
  repeatInterval: event.repeatInterval,
  repeatByDay: event.repeatByDay,
  repeatUntil: event.repeatUntil,
  repeatCount: event.repeatCount,
  latitude: event.latitude,
  longitude: event.longitude,
  placeName: event.placeName,
  address: event.address,
  url: event.url,
  googleId: event.googleId,
  googleCalendarId: event.googleCalendarId,
});

const countCertainDay = (dayOfWeek, dateFrom, dateTo) => {
  const daysBetweenDates = 1 + Math.round((dateTo-dateFrom)/(24*3600*1000));
  return Math.floor( ( daysBetweenDates + (dateFrom.getDay()+6-dayOfWeek) % 7 ) / 7 );
}

const getDayOfMonth = (byday) => {
  const dayNumOfMonth = parseInt(byday.slice(0,-2), 10);
  const dOfWeek = byday.slice(-2);
  const dOfWeekIndex = EnglishDays.findIndex(day => day.slice(0, 2).toUpperCase() === dOfWeek);

  return [dayNumOfMonth, dOfWeekIndex];
};

module.exports = { getDayBounds, getEventInstance, countCertainDay, getDayOfMonth };