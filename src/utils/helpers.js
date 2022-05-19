import {EnglishDays, EnglishMonths, UkrainianDays, UkrainianMonths} from "../constants/config";
import {LANGUAGE} from "../constants/enums";

export const getAuthHeader = () => ({ headers: { authorization: 'Bearer ' + localStorage.getItem('user') }});

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

export const formatEventTime = (start_time, end_time, is_full_day, language, militaryTime = true) => {
  if (!start_time || !end_time) return '';

  const startTime = new Date(start_time);
  const endTime = new Date(end_time);
  const startDate = startTime.toDateString();
  const endDate = endTime.toDateString();

  let [day, month, dayNumber, year] = startDate.split(' ');
  const startYear = startTime.getFullYear() !== new Date().getFullYear() ? `, ${year}` : '';
  let ukrMonth = translateMonth(month);
  let ukrDay = translateDay(day);
  const startDateString = language === LANGUAGE.EN ?
    `${day}, ${month} ${dayNumber} ${startYear}`
    : `${ukrDay}, ${dayNumber} ${ukrMonth} ${startYear}`;

  [day, month, dayNumber, year] = endDate.split(' ');
  const endYear = endTime.getFullYear() !== new Date().getFullYear() ? `, ${year}` : '';
  ukrMonth = translateMonth(month);
  ukrDay = translateDay(day);
  const endDateString = language === LANGUAGE.EN ?
    `${day}, ${month} ${dayNumber} ${endYear}`
    : `${ukrDay}, ${dayNumber} ${ukrMonth} ${endYear}`;

  const [startHours, startSuffix] = to12HourFormat(startTime.getHours(), militaryTime);
  const [endHours, endSuffix] = to12HourFormat(endTime.getHours(), militaryTime);

  const startHour = startHours.toString().padStart(2, '0');
  const startMinute = startTime.getMinutes().toString().padStart(2, '0');
  const endHour = endHours.toString().padStart(2, '0');
  const endMinute = endTime.getMinutes().toString().padStart(2, '0');

  const startTimeString = `${startHour}:${startMinute}${!militaryTime ? ' ' + startSuffix : ''}`;
  const endTimeString = `${endHour}:${endMinute}${!militaryTime ? ' ' + endSuffix : ''}`;

  if (startDate === endDate) {
    if (is_full_day) {
      return startDateString;
    } else {
      return `${startDateString} ${startTimeString} - ${endTimeString}`;
    }
  } else {
    if (is_full_day) {
      return `${startDateString} - ${endDateString}`;
    } else {
      return `${startDateString} ${startTimeString} - ${endDateString} ${endTimeString}`;
    }
  }
}

export const formatDateString = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}T${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`
};

export const roundFloat = (number, digits= 0) => Math.round(number * 10 ** digits) / 10 ** digits;

export const getDayBounds = (date) => {
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

  return [dayStart, dayEnd];
}

export const filterEventsByDate = (events, date) => {
  const [dayStart, dayEnd] = getDayBounds(date);

  return events.filter(eventData => {
    const startTime = eventData && new Date(eventData.start_time);
    startTime.setSeconds(0)
    startTime.setMilliseconds(0)
    const endTime = eventData && new Date(eventData.end_time);
    endTime.setSeconds(0)
    endTime.setMilliseconds(0)

    return eventData && eventData.start_time && eventData.end_time && startTime <= dayEnd && endTime >= dayStart;
  });
};

export const extendCollisionList = (eventToLookFor, events, collisionMap) => {
  events.forEach((event) => {
    const [ownStart, ownEnd] = [new Date(event.start_time), new Date(event.end_time)];
    const [start, end] = [new Date(eventToLookFor.start_time), new Date(eventToLookFor.end_time)];

    if (!(end < ownStart) && !(ownEnd < start) && ((ownStart <= start && end <= ownEnd)
      || (start <= ownStart && ownEnd <= end)
      || (ownStart <= start && ownEnd <= end)
      || (start <= ownStart && end <= ownEnd))) {
      if (eventToLookFor.id in collisionMap) {
        collisionMap[eventToLookFor.id].push({ id: event.id, name: event.name, startTime: ownStart });
      } else {
        collisionMap[eventToLookFor.id] = [{ id: event.id, name: event.name, startTime: ownStart }];
      }
    }
  })
};

export const getOtherEventHasSeparateCollisionsBefore = (otherEvent, collisionList) => (
  otherEvent.collisions.some(collision => (
     !collisionList.some(e=> (
       e.id === collision.id
     ))) && (
       collision.startTime < otherEvent.startTime
     ) && (
      !getOtherEventHasSeparateCollisionsBefore(collision, otherEvent.collisions)
    )
  )
);