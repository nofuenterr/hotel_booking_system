const {
  validateCreateRoomRequest,
  validateGetRoomRequest,
  validateUpdateRoomRequest,
  validateDeleteRoomRequest
} = require('./validations/roomRequest.js');

const getAllRooms = async (req, res) => {
	try {
		return res.status(200).json({ info: 'Retrieved all rooms' });
	} catch (err) {
		return res.status(400).send({ success: false, error: err.message });
	}
};

const createRoom = async (req, res) => {
	try {
		let { room_number, room_type, price_per_night } = req.body;

    if (price_per_night !== undefined) price_per_night = Number(price_per_night);

		await validateCreateRoomRequest({ room_number, room_type, price_per_night });

		return res.status(201).json({ info: 'Created new room', data: { room_number, room_type, price_per_night } });
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

const getRoom = async (req, res) => {
	try {
		let { id } = req.params;

		if (id !== undefined) id = Number(id);

    await validateGetRoomRequest({ id });

		return res.status(200).json({ info: `Retrieved room with id #${id}` });
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

const updateRoom = async (req, res) => {
	try {
    let { room_number, room_type, price_per_night } = req.body;
    let { id } = req.params;

    if (price_per_night !== undefined) price_per_night = Number(price_per_night);

		await validateUpdateRoomRequest({ id, room_number, room_type, price_per_night });

		return res.status(200).json({ info: `Updated room details with id #${id}`, data: { room_number, room_type, price_per_night } });
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

const deleteRoom = async (req, res) => {
	try {
		let { id } = req.params;

		if (id !== undefined) id = Number(id);

    await validateDeleteRoomRequest({ id });

		return res.status(200).json({ info: `Deleted room with id #${id}` });
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
  getAllRooms,
  createRoom,
  getRoom,
  updateRoom,
  deleteRoom
};