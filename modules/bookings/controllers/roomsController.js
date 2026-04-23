const {
  validateCreateRoomRequest,
  validateGetRoomRequest,
  validateUpdateRoomRequest,
  validateDeleteRoomRequest
} = require('./validations/roomRequest.js');

const getAllRooms = async (req, res, next) => {
	try {
		return res.status(200).json({ info: 'Retrieved all rooms' });
	} catch (err) {
		next(err);
	}
};

const createRoom = async (req, res, next) => {
	try {
		let { room_number, room_type, price_per_night } = req.body;

    if (price_per_night !== undefined) price_per_night = Number(price_per_night);

		await validateCreateRoomRequest({ room_number, room_type, price_per_night });

		return res.status(201).json({ info: 'Created new room', data: { room_number, room_type, price_per_night } });
	} catch (err) {
		next(err);
	}
};

const getRoom = async (req, res, next) => {
	try {
		let { id } = req.params;

		if (id !== undefined) id = Number(id);

    await validateGetRoomRequest({ id });

		return res.status(200).json({ info: `Retrieved room with id #${id}` });
	} catch (err) {
    next(err);
	}
};

const updateRoom = async (req, res, next) => {
	try {
    let { room_number, room_type, price_per_night } = req.body;
    let { id } = req.params;

    if (price_per_night !== undefined) price_per_night = Number(price_per_night);

		await validateUpdateRoomRequest({ id, room_number, room_type, price_per_night });

		return res.status(200).json({ info: `Updated room details with id #${id}`, data: { room_number, room_type, price_per_night } });
	} catch (err) {
		next(err);
	}
};

const deleteRoom = async (req, res, next) => {
	try {
		let { id } = req.params;

		if (id !== undefined) id = Number(id);

    await validateDeleteRoomRequest({ id });

		return res.status(200).json({ info: `Deleted room with id #${id}` });
	} catch (err) {
    next(err);
	}
};

module.exports = {
  getAllRooms,
  createRoom,
  getRoom,
  updateRoom,
  deleteRoom
};