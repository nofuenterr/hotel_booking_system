const {
  validateGetAllGuestBookingsRequest,
  validateCreateBookingRequest, 
  validateGetBookingRequest, 
  validateUpdateBookingRequest,
  validateCancelBookingRequest
} = require('./validations/bookingRequest.js');

const getAllGuestBookings = async (req, res) => {
	try {
		let { guest_id } = req.params;

		if (guest_id !== undefined) guest_id = Number(guest_id);

    await validateGetAllGuestBookingsRequest({ guest_id });

		return res.status(200).json({ info: `Retrieved all bookings for guest with id #${guest_id}` });
	} catch (err) {
    if (err?.name === 'ValidationError') {
			return res.status(400).json({
				success: false,
				error: "validation-error",
				errors: err?.errors || []
			});
		}

		return res.status(400).send({ success: false, error: err.message });
	}
};

const getAllBookings = async (req, res) => {
	try {
		return res.status(200).json({ info: 'Retrieved all bookings' });
	} catch (err) {
		return res.status(400).send({ success: false, error: err.message });
	}
};

const createBooking = async (req, res) => {
	try {
		let { guest_id, room_id, check_in_date, check_out_date } = req.body;

		if (guest_id !== undefined) guest_id = Number(guest_id);
		if (room_id !== undefined) room_id = Number(room_id);

		await validateCreateBookingRequest({ guest_id, room_id, check_in_date, check_out_date });

		return res.status(200).json({ guest_id, room_id, check_in_date, check_out_date });
	} catch (err) {
		if (err?.name === 'ValidationError') {
			return res.status(400).json({
				success: false,
				error: "validation-error",
				errors: err?.errors || []
			});
		}

		return res.status(400).send({ success: false, error: err.message });
	}
};

const getBooking = async (req, res) => {
	try {
		let { id } = req.params;

		if (id !== undefined) id = Number(id);

    await validateGetBookingRequest({ id });

		return res.status(200).json({ info: `Retrieved booking with id #${id}` });
	} catch (err) {
    if (err?.name === 'ValidationError') {
			return res.status(400).json({
				success: false,
				error: "validation-error",
				errors: err?.errors || []
			});
		}

		return res.status(400).send({ success: false, error: err.message });
	}
};

const updateBooking = async (req, res) => {
	try {
		let { status } = req.body;
    let { id } = req.params;

		if (id !== undefined) id = Number(id);

		await validateUpdateBookingRequest({ id, status });

		return res.status(200).json({ info: `Updated booking status with id #${id} to ${status}` });
	} catch (err) {
		if (err?.name === 'ValidationError') {
			return res.status(400).json({
				success: false,
				error: "validation-error",
				errors: err?.errors || []
			});
		}

		return res.status(400).send({ success: false, error: err.message });
	}
};

const cancelBooking = async (req, res) => {
	try {
		let { id } = req.params;

		if (id !== undefined) id = Number(id);

    await validateCancelBookingRequest({ id });

		return res.status(200).json({ info: `Cancelled booking with id #${id}` });
	} catch (err) {
    if (err?.name === 'ValidationError') {
			return res.status(400).json({
				success: false,
				error: "validation-error",
				errors: err?.errors || []
			});
		}

		return res.status(400).send({ success: false, error: err.message });
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