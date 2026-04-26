const db = require('../../../includes/db/db.js');
const { NotFoundError, BadRequestError } = require('../../../helpers/errors/customErrors.js');
const { sortOptions } = require('../controllers/validations/roomRequest.js');
const { decodeCursor, encodeCursor } = require('../../../helpers/functions/customFunctions.js');

const processGetAllRooms = async ({ check_in_date, check_out_date, typeValues, min_price, max_price, search, sort = 'newest', limit = 10, cursor }) => {
  try {
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
  } catch (err) {
    throw err;
  }
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
    if (err.code === '23505') {
      if (err.constraint === 'rooms_room_number_key') throw new BadRequestError('Room number already exists');
      throw new BadRequestError('Duplicate entry');
    }
    if (err.code === '23514') {
      if (err.constraint === 'rooms_room_number_not_blank') throw new BadRequestError('Room number cannot be blank');
      if (err.constraint === 'rooms_valid_room_type') throw new BadRequestError("Invalid room type. Must be one of: 'single', 'double', 'suite', 'deluxe'");
      if (err.constraint === 'rooms_price_positive') throw new BadRequestError('Price per night must be greater than 0');
      throw new BadRequestError('Check constraint violation');
    }
    if (err.code === '22P02') throw new BadRequestError('Invalid value for price per night. Must be a number');
    throw err;
  }
};

const processGetRoom = async ({ id }) => {
  try {
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
  } catch (err) {
    throw err;
  }
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
    if (err.code === '23505') {
      if (err.constraint === 'rooms_room_number_key') throw new BadRequestError('Room number already exists');
      throw new BadRequestError('Duplicate entry');
    }
    if (err.code === '23514') {
      if (err.constraint === 'rooms_room_number_not_blank') throw new BadRequestError('Room number cannot be blank');
      if (err.constraint === 'rooms_valid_room_type') throw new BadRequestError("Invalid room type. Must be one of: 'single', 'double', 'suite', 'deluxe'");
      if (err.constraint === 'rooms_price_positive') throw new BadRequestError('Price per night must be greater than 0');
      throw new BadRequestError('Check constraint violation');
    }
    if (err.code === '22P02') throw new BadRequestError('Invalid value for price per night. Must be a number');
    throw err;
  }
};

const processDeleteRoom = async ({ id }) => {
  try {
    const { rows } = await db.query(
      `DELETE FROM rooms 
      WHERE id = $1;`,
      [id]
    );

    if (!rows[0]) throw new NotFoundError('Room not found');

    return rows[0];
  } catch (err) {
    throw err;
  }
};

module.exports = {
  processGetAllRooms,
  processCreateRoom,
  processGetRoom,
  processUpdateRoom,
  processDeleteRoom
};