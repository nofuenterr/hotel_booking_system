const db = require('../../../includes/db/db.js');
const { NotFoundError, BadRequestError } = require('../../../helpers/errors/customErrors.js');
const { sortOptions } = require('../controllers/validations/bookingRequest.js');
const { decodeCursor, encodeCursor } = require('../../../helpers/functions/customFunctions.js');

const processGetAllGuestBookings = async ({ guest_id, statusValues, sort = 'newest', limit = 10, cursor }) => {
  try {
    const guestCheck = await db.query(`SELECT id FROM guests WHERE id = $1;`, [guest_id]);

    if (!guestCheck.rows[0]) throw new NotFoundError('Guest not found');

    const sortMeta = sortOptions[sort];
    const operator = sortMeta.direction === 'ASC' ? '>' : '<';
    const col = sortMeta.table ? `${sortMeta.table}.${sortMeta.column}` : sortMeta.column;

    const params = [guest_id];
    let query = `
      SELECT 
        id, guest_id, room_id, check_in_date, check_out_date, status, weather, created_at
      FROM bookings
      WHERE guest_id = $1
    `;

    if (statusValues && statusValues.length > 0) {  
      params.push(statusValues);
      query += ` AND status = ANY($${params.length})`;
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

const processGetAllBookings = async ({ statusValues, sort = 'newest', limit = 10, cursor }) => {
  try {
    const sortMeta = sortOptions[sort];
    const operator = sortMeta.direction === 'ASC' ? '>' : '<';
    const col = sortMeta.table ? `${sortMeta.table}.${sortMeta.column}` : sortMeta.column;

    const params = [];
    let query = `
      SELECT 
        id, guest_id, room_id, check_in_date, check_out_date, status, weather, created_at
      FROM bookings
      WHERE 1=1
    `;

    if (statusValues && statusValues.length > 0) {
      params.push(statusValues);
      query += ` AND status = ANY($${params.length})`;
    }

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

const processCreateBooking = async ({ guest_id, room_id, check_in_date, check_out_date, weather }) => {
  try {
    const dateConflictCheck = await db.query(
      `SELECT * FROM bookings
      WHERE room_id = $1
      AND status != 'cancelled'
      AND (
        check_in_date < $2
        AND check_out_date > $3
      );`,
      [room_id, check_out_date, check_in_date]
    );

    if (dateConflictCheck.rows.length > 0) throw new BadRequestError('Room is not available for the selected dates');

    const { rows } = await db.query(
      `INSERT INTO bookings (guest_id, room_id, check_in_date, check_out_date, weather) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING guest_id, room_id, check_in_date, check_out_date, weather;`,
      [guest_id, room_id, check_in_date, check_out_date, weather]
    );

    if (!rows[0]) throw new BadRequestError('Failed to create booking');

    return rows[0];
  } catch (err) {
    if (err.code === '23503') {
      if (err.constraint === 'bookings_guest_id_fkey') throw new NotFoundError('Guest not found');
      if (err.constraint === 'bookings_room_id_fkey') throw new NotFoundError('Room not found');
      throw new NotFoundError('Referenced record not found');
    }
    if (err.code === '23514') {
      if (err.constraint === 'bookings_check_out_after_check_in') throw new BadRequestError('Check out date must be after check in date');
      throw new BadRequestError('Check constraint violation');
    }
    if (err.code === '22007') throw new BadRequestError('Invalid date format. Use YYYY-MM-DD');
    throw err;
  }
};

const processGetBooking = async ({ id }) => {
  try {
    const { rows } = await db.query(
      `SELECT 
        b.id, b.check_in_date, b.check_out_date, b.status, b.weather, b.created_at,
        g.id, g.first_name, g.last_name, g.email, g.phone,
        r.id, r.room_number, r.room_type, r.price_per_night
      FROM bookings AS b
      JOIN guests AS g ON b.guest_id = g.id
      JOIN rooms AS r ON b.room_id = r.id
      WHERE b.id = $1
      LIMIT 1;`,
      [id]
    );

    if (!rows[0]) throw new NotFoundError('Booking not found');

    return rows[0];
  } catch (err) {
    throw err;
  }
};

const processUpdateBooking = async ({ id, status }) => {
  try {
    const { rows } = await db.query(
      `UPDATE bookings
      SET status = $2
      WHERE id = $1
      RETURNING id, guest_id, room_id, check_in_date, check_out_date, status;`,
      [id, status]
    );

    if (!rows[0]) throw new NotFoundError('Booking not found');

    return rows[0];
  } catch (err) {
    if (err.code === '23514') {
      if (err.constraint === 'bookings_valid_status') throw new BadRequestError("Invalid booking status. Must be one of: 'pending', 'cancelled', 'confirmed'");
      throw new BadRequestError('Check constraint violation');
    }
    if (err.code === '22007') throw new BadRequestError('Invalid date format. Use YYYY-MM-DD');
    throw err;
  }
};

const processCancelBooking = async ({ id }) => {
  try {
    const { rows } = await db.query(
      `UPDATE bookings
      SET status = 'cancelled'
      WHERE id = $1
      RETURNING id, guest_id, room_id, check_in_date, check_out_date, status;`,
      [id]
    );

    if (!rows[0]) throw new NotFoundError('Booking not found');

    return rows[0];
  } catch (err) {
    throw err;
  }
};

module.exports = {
  processGetAllGuestBookings,
  processGetAllBookings,
  processCreateBooking,
  processGetBooking,
  processUpdateBooking,
  processCancelBooking
};