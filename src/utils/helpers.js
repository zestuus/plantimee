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

export const formatEventTime = (start_time, end_time, is_full_day, militaryTime = true) => {
  if (!start_time || !end_time) return '';

  const startTime = new Date(start_time);
  const endTime = new Date(end_time);
  const startDate = startTime.toDateString();
  const endDate = endTime.toDateString();

  let [day, dayNumber, month, year] = startDate.split(' ');
  const startYear = startTime.getFullYear() !== new Date().getFullYear() ? `, ${year}` : '';
  const startDateString = `${day}, ${dayNumber} ${month} ${startYear}`;

  [day, dayNumber, month, year] = endDate.split(' ');
  const endYear = endTime.getFullYear() !== new Date().getFullYear() ? `, ${year}` : '';
  const endDateString = `${day}, ${dayNumber} ${month} ${endYear}`;

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