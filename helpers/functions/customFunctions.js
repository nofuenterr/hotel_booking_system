const encodeCursor = (value, id, direction) => {
  return Buffer.from(JSON.stringify({ value, id, direction })).toString('base64');
};

const decodeCursor = (cursor) => {
  return JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
};

module.exports = { encodeCursor, decodeCursor };