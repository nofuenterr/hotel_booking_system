const yup = require('yup');
const moment = require('moment');

const validateGetAllGuestBookingsRequest = (form) => {
	const formShape = {
		guest_id: yup.number().required()
      .integer('guest_id must be a whole number')
      .test(
        'positive-integer',
        'guest_id must be a positive integer',
        value => value > 0
      )
	};

	const schema = yup.object().shape(formShape);
	return schema.validate(form, { abortEarly: false, strict: true });
};

const validateCreateBookingRequest = (form) => {
	const formShape = {
		guest_id: yup.number().required()
      .integer('guest_id must be a whole number')
      .test(
        'positive-integer',
        'guest_id must be a positive integer',
        value => value > 0
      ),
		room_id: yup.number().required()
      .integer('room_id must be a whole number')
      .test(
        'positive-integer',
        'room_id must be a positive integer',
        value => value > 0
      ),
		check_in_date: yup.string().required()
			.matches(
				/^\d{4}-\d{2}-\d{2}$/,
				'check_in_date must be in the format YYYY-MM-DD'
			)
      .test(
        'valid-date',
        'check_in_date must be a valid date',
        value => moment(value, 'YYYY-MM-DD', true).isValid()
      ),
		check_out_date: yup.string().required()
			.matches(
				/^\d{4}-\d{2}-\d{2}$/,
				'check_out_date must be in the format YYYY-MM-DD'
			)
      .test(
        'valid-date',
        'check_out_date must be a valid date',
        value => moment(value, 'YYYY-MM-DD', true).isValid()
      ),
	};

	const schema = yup.object().shape(formShape).test(
    'checkout-after-checkin',
    'check_out_date must be after check_in_date',
    function({ check_in_date, check_out_date }) {
      if (!check_in_date || !check_out_date) return true;
      return moment(check_out_date).isAfter(moment(check_in_date));
    }
  );
	return schema.validate(form, { abortEarly: false, strict: true });
};

const validateGetBookingRequest = (form) => {
	const formShape = {
		id: yup.number().required()
      .integer('id must be a whole number')
      .test(
        'positive-integer',
        'id must be a positive integer',
        value => value > 0
      )
	};

	const schema = yup.object().shape(formShape);
	return schema.validate(form, { abortEarly: false, strict: true });
};

const validateUpdateBookingRequest = (form) => {
	const formShape = {
    id: yup.number().required()
      .integer('id must be a whole number')
      .test(
        'positive-integer',
        'id must be a positive integer',
        value => value > 0
      ),
		status: yup.string().oneOf(Object.values(['pending', 'cancelled', 'confirmed'])).required()
	};

	const schema = yup.object().shape(formShape);
	return schema.validate(form, { abortEarly: false, strict: true });
};

const validateCancelBookingRequest = (form) => {
	const formShape = {
		id: yup.number().required()
      .integer('id must be a whole number')
      .test(
        'positive-integer',
        'id must be a positive integer',
        value => value > 0
      )
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