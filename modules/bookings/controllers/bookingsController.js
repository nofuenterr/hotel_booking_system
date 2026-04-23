const { processCreateBooking } = require('../functions/bookings.js');
const {
  validateGetAllGuestBookingsRequest,
  validateCreateBookingRequest, 
  validateGetBookingRequest, 
  validateUpdateBookingRequest,
  validateCancelBookingRequest
} = require('./validations/bookingRequest.js');

const getAllGuestBookings = async (req, res, next) => {
	try {
		let { guest_id } = req.params;

		if (guest_id !== undefined) guest_id = Number(guest_id);

    await validateGetAllGuestBookingsRequest({ guest_id });

		return res.status(200).json({ info: `Retrieved all bookings for guest with id #${guest_id}` });
	} catch (err) {
    next(err);
	}
};

const getAllBookings = async (req, res, next) => {
	try {
		return res.status(200).json({ info: 'Retrieved all bookings' });
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

		return res.status(201).json({ info: 'Created new room', data: { guest_id, room_id, check_in_date, check_out_date } });
	} catch (err) {
		next(err);
	}
};

const getBooking = async (req, res, next) => {
	try {
		let { id } = req.params;

		if (id !== undefined) id = Number(id);

    await validateGetBookingRequest({ id });

		return res.status(200).json({ info: `Retrieved booking with id #${id}` });
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
    
		return res.status(200).json({ info: `Updated booking with id #${id}`, data: { status } });
	} catch (err) {
    next(err);
	}
};

const cancelBooking = async (req, res, next) => {
  try {
    let { id } = req.params;
    
		if (id !== undefined) id = Number(id);

    await validateCancelBookingRequest({ id });
    
		return res.status(200).json({ info: `Cancelled booking with id #${id}` });
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