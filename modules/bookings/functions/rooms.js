const db = require('../../../includes/db/db.js');
const { NotFoundError, BadRequestError } = require('../../../helpers/errors/customErrors.js');
const { sortOptions } = require('../controllers/validations/roomRequest.js');
const { decodeCursor, encodeCursor } = require('../../../helpers/functions/customFunctions.js');
const { pgErrors, constraints } = require('../../../helpers/functions/pgErrorHandler.js');

const processGetAllRooms = async ({ check_in_date, check_out_date, typeValues, min_price, max_price, search, sort = 'newest', limit = 10, cursor }) => {
  const sortMeta = sortOptions[sort];
  const operator = sortMeta.direction === 'ASC' ? '>' : '<';
  const col = sortMeta.table ? `${sortMeta.table}.${sortMeta.column}` : sortMeta.column;

  const params = [];
  let query = `
    SELECT 
      r.id, r.room_number, r.room_type, r.price_per_night, r.created_at
    FROM rooms r
    WHERE 1=1
  `;

  if (check_in_date && check_out_date) {
    params.push(check_out_date, check_in_date);
    query += ` AND NOT EXISTS (
      SELECT 1 FROM bookings b
      WHERE r.id = b.room_id
        AND b.status IN ('pending', 'confirmed')
        AND b.check_in_date < $${params.length - 1}
        AND b.check_out_date > $${params.length}
    )`;
  };

  if (typeValues && typeValues.length > 0) {
    params.push(typeValues);
    query += ` AND r.room_type = ANY($${params.length})`;
  };

  if (min_price) {
    params.push(min_price);
    query += ` AND r.price_per_night >= $${params.length}`;
  };

  if (max_price) {
    params.push(max_price);
    query += ` AND r.price_per_night <= $${params.length}`;
  };

  if (search) {
    params.push(`${search}%`);
    query += ` AND r.room_number LIKE $${params.length}`;
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
    ? encodeCursor(lastItem[sortMeta.column], lastItem.id, sortMeta.direction)
    : null;
  
  return { data, nextCursor, hasNextPage };
};

const processCreateRoom = async ({ room_number, room_type, price_per_night }) => {
  try {
    const { rows } = await db.query(
      `INSERT INTO rooms 
        (room_number, room_type, price_per_night) 
      VALUES 
        ($1, $2, $3)
      RETURNING id, room_number, room_type, price_per_night;`,
      [room_number, room_type, price_per_night]
    );

    if (!rows[0]) throw new BadRequestError('Failed to create room');

    return rows[0];
  } catch (err) {
    pgErrors(err, constraints.createRoom);
  }
};

const processGetRoom = async ({ id }) => {
  const { rows } = await db.query(
    `SELECT 
      id, room_number, room_type, price_per_night, created_at
    FROM rooms
    WHERE id = $1
    LIMIT 1;`,
    [id]
  );

  if (!rows[0]) throw new NotFoundError('Room not found');

  return rows[0];
};

const processUpdateRoom = async ({ id, room_number, room_type, price_per_night }) => {
  try {
    const { rows } = await db.query(
      `UPDATE rooms
      SET room_number = $2, room_type = $3, price_per_night = $4
      WHERE id = $1
      RETURNING 
        id, room_number, room_type, price_per_night;`,
      [id, room_number, room_type, price_per_night]
    );

    if (!rows[0]) throw new NotFoundError('Room not found');

    return rows[0];
  } catch (err) {
    pgErrors(err, constraints.updateRoom);
  }
};

const processDeleteRoom = async ({ id }) => {
  const { rows } = await db.query(
    `DELETE FROM rooms 
    WHERE id = $1;`,
    [id]
  );

  if (!rows[0]) throw new NotFoundError('Room not found');

  return rows[0];
};

module.exports = {
  processGetAllRooms,
  processCreateRoom,
  processGetRoom,
  processUpdateRoom,
  processDeleteRoom
};