const yup = require('yup');
const moment = require('moment');

const sortOptions = {
  newest: { column: 'created_at', direction: 'DESC', table: 'r' },
  oldest: { column: 'created_at', direction: 'ASC',  table: 'r' },
  price_asc: { column: 'price_per_night', direction: 'ASC',  table: 'r' },
  price_desc: { column: 'price_per_night', direction: 'DESC', table: 'r' },
  number_asc: { column: 'room_number', direction: 'ASC',  table: 'r' },
  number_desc: { column: 'room_number', direction: 'DESC', table: 'r' },
};

const validateGetAllRoomsRequest = async (form) => {
  const formShape = {
    check_in_date: yup.string()
      .optional()
      .nullable()
      .transform(v => v === "" ? null : v)
      .matches(
        /^\d{4}-\d{2}-\d{2}$/,
        { message: 'Format must be YYYY-MM-DD', excludeEmptyString: true }
      )
      .test(
        'valid-date',
        'check_in_date must be a valid date',
        value => !value || moment(value, 'YYYY-MM-DD', true).isValid()
      ),
    check_out_date: yup.string()
      .optional()
      .nullable()
      .transform(v => v === "" ? null : v)
      .matches(
        /^\d{4}-\d{2}-\d{2}$/,
        { message: 'Format must be YYYY-MM-DD', excludeEmptyString: true }
      )
      .test(
        'valid-date',
        'check_out_date must be a valid date',
        value => !value || moment(value, 'YYYY-MM-DD', true).isValid()
      ),
    type: yup.array()
      .of(yup.string().oneOf(['single', 'double', 'suite', 'deluxe'], "Invalid type value: Must be one of: 'single', 'double', 'suite', 'deluxe'"))
      .optional(),
    min_price: yup.number().optional(),
    max_price: yup.number().optional(),
    search: yup.string().optional(),
    sort: yup.string()
      .transform((value) => ((value === undefined || value.trim() === "") ? undefined : value))
      .oneOf(Object.keys(sortOptions), "Invalid sort option")
      .default('newest'),
    limit: yup.number()
      .transform((value) => isNaN(value) ? 10 : value)
      .min(1, 'limit must be at least 1')
      .max(50, 'limit cannot exceed 50')
      .default(10)
  };

  const schema = yup.object().shape(formShape)
    .test(
      'checkout-after-checkin',
      'check_out_date must be after check_in_date',
      function({ check_in_date, check_out_date }) {
        if (!check_in_date || !check_out_date) return true;
        return moment(check_out_date).isAfter(moment(check_in_date));
      }
    )
    .test(
      'both-dates-required', 
      'Both check_in_date and check_out_date must be provided together', 
      function(values) {
        const { check_in_date, check_out_date } = values;
        const bothExist = !!check_in_date && !!check_out_date;
        const neitherExist = !check_in_date && !check_out_date;
        return bothExist || neitherExist;
      }
    );
  return await schema.validate(form, { abortEarly: false });
};

const validateCreateRoomRequest = (form) => {
  const formShape = {
    room_number: yup.string().required(),
    room_type: yup.string().oneOf(['single', 'double', 'suite', 'deluxe']).required(),
    price_per_night: yup.number().required()
      .test(
        'greater-than-zero',
        'price_per_night must be greater than 0',
        value => value > 0
      )
  };

  const schema = yup.object().shape(formShape);
  return schema.validate(form, { abortEarly: false, strict: true });
};

const validateGetRoomRequest = (form) => {
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

const validateUpdateRoomRequest = (form) => {
  const formShape = {
    id: yup.number().required()
      .integer('id must be a whole number')
      .test(
        'positive-integer',
        'id must be a positive integer',
        value => value > 0
      ),
    room_number: yup.string().required(),
    room_type: yup.string().oneOf(['single', 'double', 'suite', 'deluxe']).required(),
    price_per_night: yup.number().required()
      .test(
        'greater-than-zero',
        'price_per_night must be greater than 0',
        value => value > 0
      )
  };

  const schema = yup.object().shape(formShape);
  return schema.validate(form, { abortEarly: false, strict: true });
};

const validateDeleteRoomRequest = (form) => {
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
  validateGetAllRoomsRequest,
  validateCreateRoomRequest,
  validateGetRoomRequest,
  validateUpdateRoomRequest,
  validateDeleteRoomRequest
};