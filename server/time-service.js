var moment = require('moment');

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/**
 * Return current date as a ISO8601 formatted date string
 * @return {string} ISO8601 formatted form, like 2013-02-04T22:44:30.652Z
 */
function currentDateTime() {
	return moment().toISOString();
}

function postgresCurrentTime() {
  return moment().format( DATE_TIME_FORMAT );
}

function parseDateTime( datetimestring ) {
  var datetime = moment( datetimestring );
  return datetime.isValid() ? datetime.format(DATE_TIME_FORMAT)  : null;
}

/**
 * Comparator for a two times can be used to sort arrays by date
 * @param a is a datetimestamp
 * @param b is a datetimestamp
 * @return -1 if a is before b, 0 if a and b are same, 1 if a is after b
 */
function compareDateTimes( a, b ) {
  var aTime = moment( a );
  var bTime = moment( b );

  if( aTime.isBefore( bTime ) ){
    return -1;
  } else if( aTime.isAfter(bTime) ) {
    return 1;
  } else {
    return 0;
  }
}

module.exports = {
  currentDateTime: currentDateTime,
  compareDateTimes: compareDateTimes,
  parseDateTime: parseDateTime,
  postgresCurrentTime: postgresCurrentTime
};
