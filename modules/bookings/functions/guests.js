const db = require('../../../includes/db/db.js');
const { NotFoundError, BadRequestError } = require('../../../helpers/errors/customErrors.js');
const { sortOptions } = require('../controllers/validations/guestRequest.js');
const { decodeCursor, encodeCursor } = require('../../../helpers/functions/customFunctions.js');
const { pgErrors, constraints } = require('../../../helpers/functions/pgErrorHandler.js');

const processGetAllGuests = async ({ search, sort = 'newest', limit = 10, cursor }) => {
  const sortMeta = sortOptions[sort];
  const operator = sortMeta.direction === 'ASC' ? '>' : '<';
  const rawColumn = sortMeta.column;
  if (rawColumn === 'first_name' || rawColumn === 'last_name') sortMeta.column = `LOWER(${rawColumn})`; 
  const col = sortMeta.table ? `${sortMeta.table}.${sortMeta.column}` : sortMeta.column;
  
  const params = [];
  let query = `
    SELECT id, first_name, last_name, email, phone, created_at
    FROM guests
    WHERE 1=1
  `;
  
  if (search) {
    params.push(`${search.toLowerCase()}%`);
    query += ` AND (LOWER(first_name) LIKE $${params.length} OR LOWER(last_name) LIKE $${params.length})`;
  };

  if (cursor) {
    const { value, id } = decodeCursor(cursor);
    params.push(value, id);
    query += ` AND (${col}, id) ${operator} ($${params.length - 1}, $${params.length})`;
  };

  params.push(limit + 1);
  query += ` ORDER BY ${col} ${sortMeta.direction}, id ${sortMeta.direction} LIMIT $${params.length}`;

  const { rows } = await db.query(query, params);

  const hasNextPage = rows.length > limit;
  const data = hasNextPage ? rows.slice(0, limit) : rows;

  const lastItem = data[data.length - 1];
  const nextCursor = hasNextPage && lastItem
    ? encodeCursor(lastItem[rawColumn], lastItem.id, sortMeta.direction)
    : null;
  
  return { data, nextCursor, hasNextPage };
};

const processCreateGuest = async ({ first_name, last_name, email, phone }) => {
  try {
    const { rows } = await db.query(
      `INSERT INTO guests (first_name, last_name, email, phone) 
      VALUES ($1, $2, $3, $4)
      RETURNING id, first_name, last_name, email, phone;`,
      [first_name, last_name, email, phone]
    );

    if (!rows[0]) throw new BadRequestError('Failed to create guest');

    return rows[0];
  } catch (err) {
    pgErrors(err, constraints.createGuest);
  }
};

const processGetGuest = async ({ id }) => {
  const { rows } = await db.query(
    `SELECT id, first_name, last_name, email, phone, created_at
    FROM guests
    WHERE id = $1
    LIMIT 1;`,
    [id]
  );

  if (!rows[0]) throw new NotFoundError('Guest not found');

  return rows[0];
};

const processUpdateGuest = async ({ id, first_name, last_name, email, phone }) => {
  try {
    const { rows } = await db.query(
      `UPDATE guests
      SET first_name = $2, last_name = $3, email = $4, phone = $5
      WHERE id = $1
      RETURNING id, first_name, last_name, email, phone;`,
      [id, first_name, last_name, email, phone]
    );

    if (!rows[0]) throw new NotFoundError('Guest not found');

    return rows[0];
  } catch (err) {
    pgErrors(err, constraints.updateGuest);
  }
};

module.exports = {
  processGetAllGuests,
  processCreateGuest,
  processGetGuest,
  processUpdateGuest
};