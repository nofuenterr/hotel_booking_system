const { NotFoundError, BadRequestError } = require('../errors/customErrors.js');

const pgErrors = (err, constraintMap = {}) => {
  if (err.code === '23503') {
    const msg = constraintMap[err.constraint] || 'Referenced record not found';
    throw new NotFoundError(msg);
  }
  if (err.code === '23505') {
    const msg = constraintMap[err.constraint] || 'Duplicate entry';
    throw new BadRequestError(msg);
  }
  if (err.code === '23514') {
    const msg = constraintMap[err.constraint] || 'Check constraint violation';
    throw new BadRequestError(msg);
  }
  if (err.code === '22001') throw new BadRequestError('One or more values exceed the maximum allowed length');
  if (err.code === '22007') throw new BadRequestError('Invalid date format. Use YYYY-MM-DD');
  if (err.code === '22P02') throw new BadRequestError('Invalid input syntax');
  throw err;
};

const constraints = {
  createBooking: {
    'bookings_guest_id_fkey': 'Guest not found',
    'bookings_room_id_fkey': 'Room not found',
    'bookings_unique_room_dates': 'Room is already booked for these dates',
    'bookings_check_out_after_check_in': 'Check out date must be after check in date',
    'bookings_valid_status': "Invalid booking status. Must be one of: 'pending', 'cancelled', 'confirmed'",
  },
  updateBooking: {
    'bookings_valid_status': "Invalid booking status. Must be one of: 'pending', 'cancelled', 'confirmed'",
  },
  createGuest: {
    'guests_email_key': 'Email already exists',
    'guests_first_name_not_blank': 'First name cannot be blank',
    'guests_last_name_not_blank': 'Last name cannot be blank',
    'guests_email_not_blank': 'Email cannot be blank',
    'guests_phone_not_blank': 'Phone cannot be blank',
  },
  updateGuest: {
    'guests_email_key': 'Email already exists',
    'guests_first_name_not_blank': 'First name cannot be blank',
    'guests_last_name_not_blank': 'Last name cannot be blank',
    'guests_email_not_blank': 'Email cannot be blank',
    'guests_phone_not_blank': 'Phone cannot be blank',
  },
  createRoom: {
    'rooms_room_number_key': 'Room number already exists',
    'rooms_room_number_not_blank': 'Room number cannot be blank',
    'rooms_valid_room_type': "Invalid room type. Must be one of: 'single', 'double', 'suite', 'deluxe'",
    'rooms_price_positive': 'Price per night must be greater than 0',
  },
  updateRoom: {
    'rooms_room_number_key': 'Room number already exists',
    'rooms_room_number_not_blank': 'Room number cannot be blank',
    'rooms_valid_room_type': "Invalid room type. Must be one of: 'single', 'double', 'suite', 'deluxe'",
    'rooms_price_positive': 'Price per night must be greater than 0',
  },
};

module.exports = { pgErrors, constraints };