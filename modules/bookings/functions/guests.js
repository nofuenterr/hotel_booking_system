const db = require('../../../includes/db/db.js');
const { NotFoundError, BadRequestError } = require('../../../helpers/errors/customErrors.js');

const processGetAllGuests = async () => {
  try {
    const { rows } = await db.query(
      `SELECT id, first_name, last_name, email, phone, created_at
      FROM guests;`
    );

    return rows;
  } catch (err) {
    throw err;
  }
};

const processCreateGuest = async ({ first_name, last_name, email, phone }) => {
  try {
    const { rows } = await db.query(
      `INSERT INTO guests (first_name, last_name, email, phone) 
      VALUES ($1, $2, $3, $4)
      RETURNING first_name, last_name, email, phone;`,
      [first_name, last_name, email, phone]
    );

    if (!rows[0]) throw new BadRequestError('Failed to create guest');

    return rows[0];
  } catch (err) {
    if (err.code === '23505') {
      if (err.constraint === 'guests_email_key') throw new BadRequestError('Email already exists');
      throw new BadRequestError('Duplicate entry');
    }
    if (err.code === '23514') {
      if (err.constraint === 'guests_first_name_not_blank') throw new BadRequestError('First name cannot be blank');
      if (err.constraint === 'guests_last_name_not_blank') throw new BadRequestError('Last name cannot be blank');
      if (err.constraint === 'guests_email_not_blank') throw new BadRequestError('Email cannot be blank');
      if (err.constraint === 'guests_phone_not_blank') throw new BadRequestError('Phone cannot be blank');
      throw new BadRequestError('Check constraint violation');
    }
    throw err;
  }
};

const processGetGuest = async ({ id }) => {
  try {
    const { rows } = await db.query(
      `SELECT id, first_name, last_name, email, phone, created_at
      FROM guests
      WHERE id = $1
      LIMIT 1;`,
      [id]
    );

    if (!rows[0]) throw new NotFoundError('Guest not found');

    return rows[0];
  } catch (err) {
    throw err;
  }
};

const processUpdateGuest = async ({ id, first_name, last_name, email, phone }) => {
  try {
    const { rows } = await db.query(
      `UPDATE guests
      SET first_name = $2, last_name = $3, email = $4, phone = $5
      WHERE id = $1;`,
      [id, first_name, last_name, email, phone]
    );

    if (!rows[0]) throw new NotFoundError('Guest not found');

    return rows[0];
  } catch (err) {
    if (err.code === '23505') {
      if (err.constraint === 'guests_email_key') throw new BadRequestError('Email already exists');
      throw new BadRequestError('Duplicate entry');
    }
    if (err.code === '23514') {
      if (err.constraint === 'guests_first_name_not_blank') throw new BadRequestError('First name cannot be blank');
      if (err.constraint === 'guests_last_name_not_blank') throw new BadRequestError('Last name cannot be blank');
      if (err.constraint === 'guests_email_not_blank') throw new BadRequestError('Email cannot be blank');
      if (err.constraint === 'guests_phone_not_blank') throw new BadRequestError('Phone cannot be blank');
      throw new BadRequestError('Check constraint violation');
    }
    throw err;
  }
};

module.exports = {
  processGetAllGuests,
  processCreateGuest,
  processGetGuest,
  processUpdateGuest
};