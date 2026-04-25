const { 
  processGetAllGuests,
  processCreateGuest,
  processGetGuest,
  processUpdateGuest
} = require('../functions/guests.js');
const {
  sortOptions,
  validateGetAllGuestsRequest,
  validateCreateGuestRequest,
  validateGetGuestRequest,
  validateUpdateGuestRequest
} = require('./validations/guestRequest.js');

const getAllGuests = async (req, res, next) => {
	try {
    let { search, sort } = req.query;

    const { sort: sortOption } = await validateGetAllGuestsRequest({ search, sort });

    const result = await processGetAllGuests({ search, sort: sortOptions[sortOption] });

		return res.status(200).json(result);
	} catch (err) {
		next(err);
	}
};

const createGuest = async (req, res, next) => {
	try {
		let { first_name, last_name, email, phone } = req.body;

		await validateCreateGuestRequest({ first_name, last_name, email, phone });

    const result = await processCreateGuest({ first_name, last_name, email, phone });

		return res.status(201).json(result);
	} catch (err) {
		next(err);
	}
};

const getGuest = async (req, res, next) => {
	try {
		let { id } = req.params;

		if (id !== undefined) id = Number(id);

    await validateGetGuestRequest({ id });

    const result = await processGetGuest({ id });

		return res.status(200).json(result);
	} catch (err) {
    next(err);
	}
};

const updateGuest = async (req, res, next) => {
	try {
		let { first_name, last_name, email, phone } = req.body;
    let { id } = req.params;

		if (id !== undefined) id = Number(id);

		await validateUpdateGuestRequest({ id, first_name, last_name, email, phone });

    const result = await processUpdateGuest({ id, first_name, last_name, email, phone });

		return res.status(200).json(result);
	} catch (err) {
		next(err);
	}
};

module.exports = {
  getAllGuests,
  createGuest,
  getGuest,
  updateGuest
};