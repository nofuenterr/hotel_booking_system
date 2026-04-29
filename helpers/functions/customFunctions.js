const moment = require('moment');

const encodeCursor = (value, id, direction) => {
  return Buffer.from(JSON.stringify({ value, id, direction })).toString('base64');
};

const decodeCursor = (cursor) => {
  return JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
};

const getRawCursorValue = (item, column) => {
  const value = item[column];
  if (!value) return value;
  if (column === 'check_in_date' || column === 'check_out_date') {
    return moment(value).format('YYYY-MM-DD');
  }
  return value instanceof Date ? value.toISOString() : value;
};

module.exports = { encodeCursor, decodeCursor, getRawCursorValue };