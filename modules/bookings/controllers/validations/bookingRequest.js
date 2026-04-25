const yup = require('yup');
const moment = require('moment');

const sortOptions = {
  check_in_date_asc: 'check_in_date ASC',
  check_in_date_desc: 'check_in_date DESC',
  check_out_date_asc: 'check_out_date ASC',
  check_out_date_desc: 'check_out_date DESC',
  newest: 'created_at DESC',
  oldest: 'created_at ASC'
};

const validateGetAllGuestBookingsRequest = async (form) => {
	const formShape = {
		guest_id: yup.number().required()
      .integer('guest_id must be a whole number')
      .test(
        'positive-integer',
        'guest_id must be a positive integer',
        value => value > 0
      ),
    status: yup.array()
      .of(yup.string().oneOf(['pending', 'cancelled', 'confirmed'], "Invalid status value: Must be one of: 'pending', 'cancelled', 'confirmed'"))
      .optional(),
    sort: yup.string()
      .transform((value) => ((value === undefined || value.trim() === "") ? undefined : value))
      .oneOf(Object.keys(sortOptions), "Invalid sort option")
      .default('newest')
	};

	const schema = yup.object().shape(formShape);
	return await schema.validate(form, { abortEarly: false });
};

const validateGetAllBookingsRequest = async (form) => {
  const formShape = {
    status: yup.array()
      .of(yup.string().oneOf(['pending', 'cancelled', 'confirmed'], "Invalid status value: Must be one of: 'pending', 'cancelled', 'confirmed'"))
      .optional(),
    sort: yup.string()
      .transform((value) => ((value === undefined || value.trim() === "") ? undefined : value))
      .oneOf(Object.keys(sortOptions), "Invalid sort option")
      .default('newest')
  };

  const schema = yup.object().shape(formShape);
  return await schema.validate(form, { abortEarly: false });
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
		status: yup.string().oneOf(['pending', 'cancelled', 'confirmed']).required()
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
  sortOptions,
  validateGetAllGuestBookingsRequest,
  validateGetAllBookingsRequest,
  validateCreateBookingRequest, 
  validateGetBookingRequest, 
  validateUpdateBookingRequest, 
  validateCancelBookingRequest 
};