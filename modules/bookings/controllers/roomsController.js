const { 
  processGetAllRooms, 
  processCreateRoom,
  processGetRoom,
  processUpdateRoom,
  processDeleteRoom
} = require('../functions/rooms.js');
const {
  sortOptions,
  validateGetAllRoomsRequest,
  validateCreateRoomRequest,
  validateGetRoomRequest,
  validateUpdateRoomRequest,
  validateDeleteRoomRequest
} = require('./validations/roomRequest.js');

const getAllRooms = async (req, res, next) => {
	try {
    let { check_in_date, check_out_date, type, min_price, max_price, search, sort } = req.query;

    if (type !== undefined) type = type.split(',').map(t => t.trim()).filter(Boolean);    
    if (min_price !== undefined) min_price = Number(min_price);
    if (max_price !== undefined) max_price = Number(max_price);

    const { type: typeValues, sort: sortOption } = await validateGetAllRoomsRequest({ check_in_date, check_out_date, type, min_price, max_price, search, sort });

    const result = await processGetAllRooms({ check_in_date, check_out_date, typeValues, min_price, max_price, search, sort: sortOptions[sortOption] });

		return res.status(200).json(result);
	} catch (err) {
		next(err);
	}
};

const createRoom = async (req, res, next) => {
	try {
		let { room_number, room_type, price_per_night } = req.body;

    if (price_per_night !== undefined) price_per_night = Number(price_per_night);

		await validateCreateRoomRequest({ room_number, room_type, price_per_night });

    const result = await processCreateRoom({ room_number, room_type, price_per_night });

		return res.status(201).json(result);
	} catch (err) {
		next(err);
	}
};

const getRoom = async (req, res, next) => {
	try {
		let { id } = req.params;

		if (id !== undefined) id = Number(id);

    await validateGetRoomRequest({ id });

    const result = await processGetRoom({ id });

		return res.status(200).json(result);
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

    const result = await processUpdateRoom({ id, room_number, room_type, price_per_night });

		return res.status(200).json(result);
	} catch (err) {
		next(err);
	}
};

const deleteRoom = async (req, res, next) => {
	try {
		let { id } = req.params;

		if (id !== undefined) id = Number(id);

    await validateDeleteRoomRequest({ id });

    const result = await processDeleteRoom({ id });

		return res.status(200).json(result);
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