const { EnglishDays, DAY } = require("../constants/data");
const { ABSOLUTE_UNIT_GETTERS } = require("../constants/enums");

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

const getEventInstance = (event, startTime, endTime, attendees, extraFields = {}) => ({
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

const getDaysBetweenDates = (dateFrom, dateTo) => Math.floor((dateTo - dateFrom) / DAY);

const countCertainDaySinceStartOfMonth = (dayOfWeek, date) => {
  const startOfMonth = new Date(date.toISOString().slice(0,7));

  startOfMonth.setMinutes(startOfMonth.getMinutes() + startOfMonth.getTimezoneOffset());

  return Math.floor((getDaysBetweenDates(startOfMonth, date) + 1) / 7) + (
    getWeekdayNumber(startOfMonth) <= dayOfWeek && getDaysBetweenDates(startOfMonth, date) > 7
  );
};

const countCertainDayTillEndOfMonth = (dayOfWeek, date) => {
  const endOfMonth = new Date(date.toISOString().slice(0,7));

  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(endOfMonth.getDate() - 1);
  endOfMonth.setUTCHours(23,59,59,999);
  endOfMonth.setMinutes(endOfMonth.getMinutes() + endOfMonth.getTimezoneOffset());

  return Math.floor(getDaysBetweenDates(date, endOfMonth) / 7) + (
    dayOfWeek <= getWeekdayNumber(endOfMonth) && getDaysBetweenDates(date, endOfMonth) > 7
  );
};

const getDayOfMonth = (byday) => {
  const dayNumOfMonth = parseInt(byday.slice(0,-2), 10);
  const dOfWeek = byday.slice(-2);
  const dOfWeekIndex = EnglishDays.findIndex(day => day.slice(0, 2).toUpperCase() === dOfWeek);

  return [dayNumOfMonth, dOfWeekIndex];
};

const getWeekdayNumber = (date) => (date.getDay() || 7) - 1;

const checkRepeatIntervalMatch = (startDate, repeatInterval, repeatFreq, compareDate) => (
  ((ABSOLUTE_UNIT_GETTERS[repeatFreq](compareDate) - ABSOLUTE_UNIT_GETTERS[repeatFreq](startDate)) % (repeatInterval || 1)) === 0
);

module.exports = {
  getDayBounds,
  getEventInstance,
  countCertainDaySinceStartOfMonth,
  countCertainDayTillEndOfMonth,
  getDayOfMonth,
  getWeekdayNumber,
  checkRepeatIntervalMatch
};