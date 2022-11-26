const {
  getDayAbsoluteNumber, getWeekAbsoluteNumber, getMonthAbsoluteNumber, getYearAbsoluteNumber
} = require("../utils/unitGetters");

const AVAILABILITY_STATUS = Object.freeze({
  CAN_ATTEND: 'CAN_ATTEND',
  BE_LATE: 'BE_LATE',
  LEAVE_EARLY: 'LEAVE_EARLY',
  BE_LATE_LEAVE_EARLY: 'BE_LATE_LEAVE_EARLY',
  CANNOT_ATTEND: 'CANNOT_ATTEND',
});

const REPEAT_FREQ = Object.freeze({
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
});

const ABSOLUTE_UNIT_GETTERS = Object.freeze({
  [REPEAT_FREQ.DAILY]: getDayAbsoluteNumber,
  [REPEAT_FREQ.WEEKLY]: getWeekAbsoluteNumber,
  [REPEAT_FREQ.MONTHLY]: getMonthAbsoluteNumber,
  [REPEAT_FREQ.YEARLY]: getYearAbsoluteNumber,
});

module.exports = { AVAILABILITY_STATUS, REPEAT_FREQ, ABSOLUTE_UNIT_GETTERS };