const yup = require('yup');

const validateGetAllGuestBookingsRequest = (form) => {
	const formShape = {
		guest_id: yup.number().required()
	};

	const schema = yup.object().shape(formShape);
	return schema.validate(form, { abortEarly: false, strict: true });
};

const validateCreateBookingRequest = (form) => {
	const formShape = {
		guest_id: yup.number().required(),
		room_id: yup.number().required(),
		check_in_date: yup.string().required()
			.matches(
				/^\d{4}-\d{2}-\d{2}$/,
				'check_in_date must be in the format YYYY-MM-DD'
			),
		check_out_date: yup.string().required()
			.matches(
				/^\d{4}-\d{2}-\d{2}$/,
				'check_out_date must be in the format YYYY-MM-DD'
			)
	};

	const schema = yup.object().shape(formShape);
	return schema.validate(form, { abortEarly: false, strict: true });
};

const validateGetBookingRequest = (form) => {
	const formShape = {
		id: yup.number().required()
	};

	const schema = yup.object().shape(formShape);
	return schema.validate(form, { abortEarly: false, strict: true });
};

const validateUpdateBookingRequest = (form) => {
	const formShape = {
    id: yup.number().required(),
		status: yup.string().oneOf(Object.values(['pending', 'cancelled', 'confirmed'])).required()
	};

	const schema = yup.object().shape(formShape);
	return schema.validate(form, { abortEarly: false, strict: true });
};

const validateCancelBookingRequest = (form) => {
	const formShape = {
		id: yup.number().required()
	};

	const schema = yup.object().shape(formShape);
	return schema.validate(form, { abortEarly: false, strict: true });
};

module.exports = {
  validateGetAllGuestBookingsRequest,
  validateCreateBookingRequest, 
  validateGetBookingRequest, 
  validateUpdateBookingRequest, 
  validateCancelBookingRequest 
};