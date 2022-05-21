import {EnglishDays, EnglishMonths, UkrainianDays, UkrainianMonths} from "../constants/config";
import {LANGUAGE} from "../constants/enums";
import { loadStorageItem } from "./localStorage";
import { findLocationByAddress } from "../api/maps";

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

export const getGoogleTokenExpired = () => (
  !loadStorageItem('googleOAuthToken') || (new Date(loadStorageItem('googleOAuthTokenExpireDate')) < new Date())
);

export const googleCalendarEventToPlantimeeEvent = async(event) => {
  const {
    id: googleId,
    description,
    summary: name,
    start: { dateTime: startDateTime, date: startDate },
    end: { dateTime: endDateTime, date: endDate },
    hangoutLink: url,
    creator: { email },
    organizer: { email: googleCalendarId },
    attendees,
    location
  } = event;

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

  return {
    ...venue,
    name,
    description,
    url,
    googleId,
    googleCalendarId,
    startTime: startDateTime || startDate,
    endTime: endDateTime || endDate,
    isFullDay: !startDateTime && !endDateTime,
    attendees: attendees && attendees.filter(attendee => attendee.email !== email) ,
  }
};