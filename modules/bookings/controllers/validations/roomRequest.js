const yup = require('yup');

const validateCreateRoomRequest = (form) => {
  const formShape = {
    room_number: yup.string().required(),
    room_type: yup.string().oneOf(Object.values(['single', 'double', 'suite', 'deluxe'])).required(),
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
    room_number: yup.string().required(),
    room_type: yup.string().oneOf(Object.values(['single', 'double', 'suite', 'deluxe'])).required(),
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
  validateCreateRoomRequest,
  validateGetRoomRequest,
  validateUpdateRoomRequest,
  validateDeleteRoomRequest
};