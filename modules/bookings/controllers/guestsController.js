const {
  validateCreateGuestRequest,
  validateGetGuestRequest,
  validateUpdateGuestRequest
} = require('./validations/guestRequest.js');

const getAllGuests = async (req, res) => {
	try {
		return res.status(200).json({ info: 'Retrieved all guests' });
	} catch (err) {
		return res.status(400).send({ success: false, error: err.message });
	}
};

const createGuest = async (req, res) => {
	try {
		let { first_name, last_name, email, phone } = req.body;

		await validateCreateGuestRequest({ first_name, last_name, email, phone });

		return res.status(201).json({ first_name, last_name, email, phone });
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

const getGuest = async (req, res) => {
	try {
		let { id } = req.params;

		if (id !== undefined) id = Number(id);

    await validateGetGuestRequest({ id });

		return res.status(200).json({ info: `Retrieved guest with id #${id}` });
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

const updateGuest= async (req, res) => {
	try {
		let { first_name, last_name, email, phone } = req.body;
    let { id } = req.params;

		if (id !== undefined) id = Number(id);

		await validateUpdateGuestRequest({ first_name, last_name, email, phone });

		return res.status(200).json({ info: `Updated guest details with id #${id}`, data: { first_name, last_name, email, phone } });
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
  getAllGuests,
  createGuest,
  getGuest,
  updateGuest
};