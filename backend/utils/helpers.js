const { EnglishDays, DAY } = require("../constants/data");
const { ABSOLUTE_UNIT_GETTERS } = require("../constants/enums");

const getDayBounds = (date = new Date()) => {
  const dayStart = new Date(date);
  dayStart.setHours(0);
  dayStart.setMinutes(0);
  dayStart.setSeconds(0);
  dayStart.setMilliseconds(0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23);
  dayEnd.setMinutes(59);
  dayEnd.setSeconds(59);
  dayEnd.setMilliseconds(999);

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

const checkRepeatIntervalMatch = (startDate, repeatInterval, repeatFreq, compareDate) => {
  const unitGetter = ABSOLUTE_UNIT_GETTERS[repeatFreq];

  return ((unitGetter(compareDate) - unitGetter(startDate)) % (repeatInterval || 1)) === 0;
};

const getDateObjectFromTimeString = (timeString, date = null) => {
  const [hours, minutes] = timeString.split(':');
  const result = date ? new Date(date) : new Date();
  result.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  return result;
};

const getDayTimeLimitingTasks = (from, to, timeFrom, timeTo) => {
  const result = [];
  let currDayStart = new Date(from);
  let { dayEnd: currDayEnd } = getDayBounds(currDayStart);
  if (currDayStart < to && to < currDayEnd) {
    currDayEnd = new Date(to);
  }
  currDayEnd.setMinutes(currDayEnd.getMinutes() + 1, 0, 0);

  while (currDayStart <= to) {
    const startTimeInDay = getDateObjectFromTimeString(timeFrom, currDayStart);
    const endTimeInDay = getDateObjectFromTimeString(timeTo, currDayStart);
    if (endTimeInDay <= currDayStart || currDayEnd <= startTimeInDay) {
      result.push([currDayStart.getTime(), currDayEnd.getTime()]);
    } else {
      if (currDayStart < startTimeInDay && startTimeInDay < currDayEnd) {
        result.push([currDayStart.getTime(), startTimeInDay.getTime()]);
      }
      if (currDayStart < endTimeInDay && endTimeInDay < currDayEnd) {
        result.push([endTimeInDay.getTime(), currDayEnd.getTime()]);
      }
    }
    currDayStart = new Date(currDayEnd);
    ({ dayEnd: currDayEnd } = getDayBounds(currDayEnd));
    if (currDayStart < to && to < currDayEnd) {
      currDayEnd = new Date(to);
    }
    currDayEnd.setMinutes(currDayEnd.getMinutes() + 1, 0, 0);
  }

  return result;
}

const getSegmentDatesMap = ([from, to]) => [new Date(from), new Date(to)];

module.exports = {
  getDayBounds,
  getEventInstance,
  countCertainDaySinceStartOfMonth,
  countCertainDayTillEndOfMonth,
  getDayOfMonth,
  getWeekdayNumber,
  checkRepeatIntervalMatch,
  getDayTimeLimitingTasks,
  getSegmentDatesMap
};