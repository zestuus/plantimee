import {EnglishDays, EnglishMonths, UkrainianDays, UkrainianMonths} from "../constants/config";
import {LANGUAGE} from "../constants/enums";
import { loadStorageItem } from "./localStorage";
import { findLocationByAddress } from "../api/maps";
import { REPEAT_FREQ } from '../constants/enums';

export const getAuthHeader = () => ({ headers: { authorization: `Bearer ${loadStorageItem('user')}` }});

export const getGoogleAuthHeader = () => ({ headers: { Authorization: `Bearer ${loadStorageItem('googleOAuthToken')}` }});

export const getWindowSize = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

export const to12HourFormat = (hours, militaryTime = true) => {
  if (militaryTime) {
    return [hours, ''];
  } else {
    const suffix = hours >= 12 ? 'pm' : 'am';
    return [hours % 12 || 12, suffix];
  }
};

export const translateMonth = (month, slice=true) => {
  const index = EnglishMonths.findIndex(m => m.slice(0, slice ? 3 : month.length) === month);

  return UkrainianMonths[index] ? UkrainianMonths[index].slice(0, slice ? 3 : month.length) : month;
};

export const translateDay = (day, slice=true) => {
  const index = EnglishDays.findIndex(d => d.slice(0, slice ? 3 : day.length) === day);

  return UkrainianDays[index] ? UkrainianDays[index][0] + UkrainianDays[index][(index === 1 || index === 4) ? 3 : 2] : day;
};

export const formatEventTime = (startTime, endTime, isFullDay, language, militaryTime = true) => {
  if (!startTime || !endTime) return '';

  const startDateTime = new Date(startTime);
  const endDateTime = new Date(endTime);
  const startDate = startDateTime.toDateString();
  const endDate = endDateTime.toDateString();

  let [day, month, dayNumber, year] = startDate.split(' ');
  const startYear = startDateTime.getFullYear() !== new Date().getFullYear() ? `, ${year}` : '';
  let ukrMonth = translateMonth(month);
  let ukrDay = translateDay(day);
  const startDateString = language === LANGUAGE.EN ?
    `${day}, ${month} ${dayNumber} ${startYear}`
    : `${ukrDay}, ${dayNumber} ${ukrMonth} ${startYear}`;

  [day, month, dayNumber, year] = endDate.split(' ');
  const endYear = endDateTime.getFullYear() !== new Date().getFullYear() ? `, ${year}` : '';
  ukrMonth = translateMonth(month);
  ukrDay = translateDay(day);
  const endDateString = language === LANGUAGE.EN ?
    `${day}, ${month} ${dayNumber} ${endYear}`
    : `${ukrDay}, ${dayNumber} ${ukrMonth} ${endYear}`;

  const [startHours, startSuffix] = to12HourFormat(startDateTime.getHours(), militaryTime);
  const [endHours, endSuffix] = to12HourFormat(endDateTime.getHours(), militaryTime);

  const startHour = startHours.toString().padStart(2, '0');
  const startMinute = startDateTime.getMinutes().toString().padStart(2, '0');
  const endHour = endHours.toString().padStart(2, '0');
  const endMinute = endDateTime.getMinutes().toString().padStart(2, '0');

  const startDateTimeString = `${startHour}:${startMinute}${!militaryTime ? ' ' + startSuffix : ''}`;
  const endDateTimeString = `${endHour}:${endMinute}${!militaryTime ? ' ' + endSuffix : ''}`;

  if (startDate === endDate) {
    if (isFullDay) {
      return startDateString;
    } else {
      return `${startDateString} ${startDateTimeString} - ${endDateTimeString}`;
    }
  } else {
    if (isFullDay) {
      return `${startDateString} - ${endDateString}`;
    } else {
      return `${startDateString} ${startDateTimeString} - ${endDateString} ${endDateTimeString}`;
    }
  }
}

export const formatDateString = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}T${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`
};

export const roundFloat = (number, digits= 0) => Math.round(number * 10 ** digits) / 10 ** digits;

export const getDayBounds = (date = new Date()) => {
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

export const filterEventsByDate = (events, date) => {
  const { dayStart, dayEnd } = getDayBounds(date);

  return events ? events.reduce((acc, eventData) => {
    const startDateTime = eventData && new Date(eventData.startTime);
    if (startDateTime) {
      startDateTime.setSeconds(0);
      startDateTime.setMilliseconds(0);
    }
    const endDateTime = eventData && new Date(eventData.endTime);
    if (endDateTime) {
      endDateTime.setSeconds(0);
      endDateTime.setMilliseconds(0);
    }

    if (eventData && eventData.startTime && eventData.endTime && startDateTime <= dayEnd && endDateTime >= dayStart) {
      if (eventData.isFullDay) {
        acc[1].push(eventData);
      } else {
        acc[0].push(eventData);
      }
    }

    return acc;
  }, [[], []]) : [[], []];
};

export const extendCollisionList = (eventToLookFor, events, collisionMap) => {
  events.forEach((event) => {
    const [ownStart, ownEnd] = [new Date(event.startTime), new Date(event.endTime)];
    const [start, end] = [new Date(eventToLookFor.startTime), new Date(eventToLookFor.endTime)];

    if (!(end < ownStart) && !(ownEnd < start) && ((ownStart <= start && end <= ownEnd)
      || (start <= ownStart && ownEnd <= end)
      || (ownStart <= start && ownEnd <= end)
      || (start <= ownStart && end <= ownEnd))) {
      if (eventToLookFor.id in collisionMap) {
        collisionMap[eventToLookFor.id].push({ id: event.id, name: event.name, startDateTime: ownStart });
      } else {
        collisionMap[eventToLookFor.id] = [{ id: event.id, name: event.name, startDateTime: ownStart }];
      }
    }
  })
};

export const getOtherEventHasSeparateCollisionsBefore = (otherEvent, collisionList) => (
  otherEvent.collisions.some(collision => (
     !collisionList.some(e=> (
       e.id === collision.id
     ))) && (
       collision.startDateTime < otherEvent.startDateTime
     ) && (
      !getOtherEventHasSeparateCollisionsBefore(collision, otherEvent.collisions)
    )
  )
);

export const countCertainDay = (dayOfWeek, dateFrom, dateTo) => {
  const daysBetweenDates = 1 + Math.round((dateTo-dateFrom)/(24*3600*1000));
  return Math.floor( ( daysBetweenDates + (dateFrom.getDay()+6-dayOfWeek) % 7 ) / 7 );
}

export const isMonthlyByDayValue = (value) => value && !isNaN(value.slice(0, -2)) && EnglishDays.find(day => day.slice(0, 2).toUpperCase() === value.slice(-2));

export const getPluralizePeriodsSuffix = (interval) => {
  if (!interval || interval === 1) {
    return '';
  } else if ((5 <= interval && interval <= 20) || (5 <= (interval % 10) && (interval % 10) <= 9) || ((interval % 10) === 0)) {
    return 's ';
  } else if ((2 <= interval && interval <= 4) || (2 <= (interval % 10) && (interval % 10) <= 4)) {
    return 's';
  } else if ((interval % 10) === 1) {
    return 's  ';
  }
};

export const getDayOfMonth = (byday) => {
  const dayNumOfMonth = parseInt(byday.slice(0,-2), 10);
  const dOfWeek = byday.slice(-2);
  const dOfWeekIndex = EnglishDays.findIndex(day => day.slice(0, 2).toUpperCase() === dOfWeek);

  return [dayNumOfMonth, dOfWeekIndex];
};

export const getGoogleTokenExpired = () => (
  !loadStorageItem('googleOAuthToken') || (new Date(loadStorageItem('googleOAuthTokenExpireDate')) < new Date())
);

export const getRRuleField = (rrule, field) => {
  const rightHalf = rrule.split(field + '=')[1];
  return rightHalf && rightHalf.split(';')[0]
};

export const formatRRuleDate = (date) => `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,11)}:${date.slice(11,13)}:${date.slice(13)}`;

const updateDateKeepTime = (time, date) => {
  const result = new Date(time);
  const dateToCopy = new Date(date);
  result.setFullYear(dateToCopy.getFullYear());
  result.setMonth(dateToCopy.getMonth());
  result.setDate(dateToCopy.getDate());

  return result;
};

export const getEventRecurrenceEndDate = (event) => {
  if (event.repeatUntil) {
    return updateDateKeepTime(event.endTime, event.repeatUntil);
  } else if (event.repeatCount) {
    const endTime = new Date(event.endTime);
    switch (event.repeatFreq) {
      case REPEAT_FREQ.DAILY:
        endTime.setDate(endTime.getDate() + (event.repeatInterval || 1) * event.repeatCount);
        break;
      case REPEAT_FREQ.WEEKLY:
        endTime.setDate(endTime.getDate() + (event.repeatInterval || 1) * 7 * event.repeatCount);
        break;
      case REPEAT_FREQ.MONTHLY:
        endTime.setMonth(endTime.getMonth() + (event.repeatInterval || 1) * event.repeatCount);
        break;
      case REPEAT_FREQ.YEARLY:
        endTime.setFullYear(endTime.getFullYear() + (event.repeatInterval || 1) * event.repeatCount);
        break;
      default: break;
    }
    return endTime;
  }
  return null;
};

export const googleCalendarEventToPlantimeeEvent = async(event) => {
  const {
    id: googleId,
    description,
    summary: name,
    start: { dateTime: startDateTime, date: startDate },
    end: { dateTime: endDateTime, date: endDateNextDay },
    hangoutLink: url,
    creator: { email },
    organizer: { email: googleCalendarId },
    attendees,
    location,
    recurrence,
  } = event;

  let repeat = {};
  if (recurrence) {
    const [rrule] = recurrence;

    repeat.repeatEnabled = true;
    repeat.repeatFreq = getRRuleField(rrule, 'FREQ');
    repeat.repeatByDay = getRRuleField(rrule, 'BYDAY');
    repeat.repeatUntil = getRRuleField(rrule, 'UNTIL');
    repeat.repeatUntil = repeat.repeatUntil && formatRRuleDate(repeat.repeatUntil);
    repeat.repeatInterval = getRRuleField(rrule, 'INTERVAL');
    repeat.repeatInterval = repeat.repeatInterval && parseInt(repeat.repeatInterval, 10);
    repeat.repeatCount = getRRuleField(rrule, 'COUNT');
    repeat.repeatCount = repeat.repeatCount && parseInt(repeat.repeatCount, 10);
  }

  let venue = {};
  if (location) {
    const geocodeResult = await findLocationByAddress({
      address: location,
      language: loadStorageItem('language'),
    });

    if (geocodeResult) {
      const { results } = geocodeResult;
      const { formatted_address: address, placeName, geometry: { location: { lat: latitude, lng: longitude } } } = results[0];

      venue = { address, placeName, latitude, longitude };
    }
  }

  let endDate;
  if (endDateNextDay) {
    endDate = endDateNextDay && new Date(endDateNextDay)
    endDate.setDate(endDate.getDate() - 1);
  }

  return {
    ...venue,
    ...repeat,
    name,
    description,
    url,
    googleId,
    googleCalendarId,
    startTime: startDateTime || startDate,
    endTime: endDateTime || endDate.toISOString().split('T')[0],
    isFullDay: !startDateTime && !endDateTime,
    attendees: attendees && attendees.filter(attendee => attendee.email !== email) ,
  }
};