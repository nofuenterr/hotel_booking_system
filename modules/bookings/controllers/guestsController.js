const {
  validateCreateGuestRequest,
  validateGetGuestRequest,
  validateUpdateGuestRequest
} = require('./validations/guestRequest.js');

const getAllGuests = async (req, res, next) => {
	try {
		return res.status(200).json({ info: 'Retrieved all guests' });
	} catch (err) {
		next(err);
	}
};

const createGuest = async (req, res, next) => {
	try {
		let { first_name, last_name, email, phone } = req.body;

		await validateCreateGuestRequest({ first_name, last_name, email, phone });

		return res.status(201).json({ info: 'Created new guest', data: { first_name, last_name, email, phone } });
	} catch (err) {
		next(err);
	}
};

const getGuest = async (req, res, next) => {
	try {
		let { id } = req.params;

		if (id !== undefined) id = Number(id);

    await validateGetGuestRequest({ id });

		return res.status(200).json({ info: `Retrieved guest with id #${id}` });
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

		return res.status(200).json({ info: `Updated guest details with id #${id}`, data: { first_name, last_name, email, phone } });
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