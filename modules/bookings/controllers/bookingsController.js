const { 
  processGetAllGuestBookings,
  processGetAllBookings,
  processCreateBooking,
  processGetBooking,
  processUpdateBooking,
  processCancelBooking
} = require('../functions/bookings.js');
const {
  validateGetAllGuestBookingsRequest,
  validateGetAllBookingsRequest,
  validateCreateBookingRequest, 
  validateGetBookingRequest, 
  validateUpdateBookingRequest,
  validateCancelBookingRequest
} = require('./validations/bookingRequest.js');
const { fetchWeatherForDate } = require('../../../helpers/services/weatherService.js');

const getAllGuestBookings = async (req, res, next) => {
	try {
		let { guest_id } = req.params;
    let { status, sort, limit, cursor } = req.query;

		if (guest_id !== undefined) guest_id = Number(guest_id);
    if (status !== undefined) status = status.split(',').map(s => s.trim()).filter(Boolean);
    if (limit !== undefined) limit = Number(limit);

    const validated = await validateGetAllGuestBookingsRequest({ guest_id, status, sort, limit });

    const result = await processGetAllGuestBookings({ 
      guest_id,
      statusValues: validated.status,
      sort: validated.sort,
      limit: validated.limit,
      cursor
    });

		return res.status(200).json(result);
	} catch (err) {
    next(err);
	}
};

const getAllBookings = async (req, res, next) => {
	try {
    let { status, sort, limit, cursor } = req.query;
    
    if (status !== undefined) status = status.split(',').map(s => s.trim()).filter(Boolean);
    if (limit !== undefined) limit = Number(limit);

    const validated = await validateGetAllBookingsRequest({ status, sort, limit });

    const result = await processGetAllBookings({ 
      statusValues: validated.status,
      sort: validated.sort,
      limit: validated.limit,
      cursor
    });

		return res.status(200).json(result);
	} catch (err) {
    next(err);
	}
};

const createBooking = async (req, res, next) => {
	try {
		let { guest_id, room_id, check_in_date, check_out_date } = req.body;

		if (guest_id !== undefined) guest_id = Number(guest_id);
		if (room_id !== undefined) room_id = Number(room_id);

		await validateCreateBookingRequest({ guest_id, room_id, check_in_date, check_out_date });    

    const weather = await fetchWeatherForDate(check_in_date);

    const result = await processCreateBooking({ guest_id, room_id, check_in_date, check_out_date, weather });

		return res.status(201).json(result);
	} catch (err) {
		next(err);
	}
};

const getBooking = async (req, res, next) => {
	try {
		let { id } = req.params;

		if (id !== undefined) id = Number(id);

    await validateGetBookingRequest({ id });

    const result = await processGetBooking({ id });

		return res.status(200).json(result);
	} catch (err) {
    next(err);
	}
};

const updateBooking = async (req, res, next) => {
  try {
    let { status } = req.body;
    let { id } = req.params;

		if (id !== undefined) id = Number(id);
    
		await validateUpdateBookingRequest({ id, status });

    const result = await processUpdateBooking({ id, status });
    
		return res.status(200).json(result);
	} catch (err) {
    next(err);
	}
};

const cancelBooking = async (req, res, next) => {
  try {
    let { id } = req.params;
    
		if (id !== undefined) id = Number(id);

    await validateCancelBookingRequest({ id });

    const result = await processCancelBooking({ id });
    
		return res.status(200).json(result);
	} catch (err) {
    next(err);
	}
};

module.exports = {
  getAllGuestBookings, 
  getAllBookings, 
  createBooking, 
  getBooking, 
  updateBooking, 
  cancelBooking 
};