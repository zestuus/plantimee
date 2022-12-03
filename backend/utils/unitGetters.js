const { MINUTE, DAY, WEEK } = require("../constants/data");

const getDayAbsoluteNumber = (date) => Math.floor((date - (date.getTimezoneOffset() * MINUTE)) / DAY);

const getWeekAbsoluteNumber = (date) => Math.round(date / WEEK);

const getMonthAbsoluteNumber = (date) => (date.getMonth() + 1) + date.getFullYear() * 12;

const getYearAbsoluteNumber = (date) => date.getFullYear();

module.exports = {
  getDayAbsoluteNumber,
  getWeekAbsoluteNumber,
  getMonthAbsoluteNumber,
  getYearAbsoluteNumber
}