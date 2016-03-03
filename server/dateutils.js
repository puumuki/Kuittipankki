/**
 * Date and time utilities
 */
var moment = require('moment');

var dateFormat = 'YYYY-MM-DD';
var dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';

/**
 * Return current date time as string
 * @return {string} current date and time at YYYY-MM-DD HH:mm:ss format
 */
function currentDateTime() {
  return moment().utc().format(dateTimeFormat);
}

/**
 * Return current date as string
 * @return {string} current date at YYYY-MM-DD format
 */
function currentDate() {
  return moment().utc().format(dateFormat);
}

module.exports = {
  currentDateTime: currentDateTime,
  currentDate:currentDate
};