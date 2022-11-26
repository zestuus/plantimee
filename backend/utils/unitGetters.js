const { DAY, WEEK } = require("../constants/data");

const getDayAbsoluteNumber = (date) => Math.round(date / DAY);

const getWeekAbsoluteNumber = (date) => Math.round(date / WEEK);

const getMonthAbsoluteNumber = (date) => (date.getMonth() + 1) + date.getFullYear() * 12;

const getYearAbsoluteNumber = (date) => date.getFullYear();

module.exports = {
  getDayAbsoluteNumber,
  getWeekAbsoluteNumber,
  getMonthAbsoluteNumber,
  getYearAbsoluteNumber
}