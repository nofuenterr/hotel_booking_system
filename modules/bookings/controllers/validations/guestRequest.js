const yup = require('yup');

const sortOptions = {
  first_name_asc: 'first_name ASC',
  first_name_desc: 'first_name DESC',
  last_name_asc: 'last_name ASC',
  last_name_desc: 'last_name DESC',
  email_asc: 'email ASC',
  email_desc: 'email DESC',
  newest: 'created_at DESC',
  oldest: 'created_at ASC'
};

const validateGetAllGuestsRequest = async (form) => {
  const formShape = {
    search: yup.string().optional(),
    sort: yup.string()
      .transform((value) => ((value === undefined || value.trim() === "") ? undefined : value))
      .oneOf(Object.keys(sortOptions), "Invalid sort option")
      .default('newest')
  };

  const schema = yup.object().shape(formShape);
  return await schema.validate(form, { abortEarly: false });
};

const validateCreateGuestRequest = (form) => {
  const formShape = {
    first_name: yup.string().required(),
    last_name: yup.string().required(),
    email: yup.string().email('invalid email address').required(),
    phone: yup.string()
  };

  const schema = yup.object().shape(formShape);
  return schema.validate(form, { abortEarly: false, strict: true });
};

const validateGetGuestRequest = (form) => {
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

const validateUpdateGuestRequest = (form) => {
  const formShape = {
    id: yup.number().required()
      .integer('id must be a whole number')
      .test(
        'positive-integer',
        'id must be a positive integer',
        value => value > 0
      ),
    first_name: yup.string().required(),
    last_name: yup.string().required(),
    email: yup.string().email('invalid email address').required(),
    phone: yup.string()
  };

  const schema = yup.object().shape(formShape);
  return schema.validate(form, { abortEarly: false, strict: true });
};

module.exports = {
  sortOptions,
  validateGetAllGuestsRequest,
  validateCreateGuestRequest,
  validateGetGuestRequest,
  validateUpdateGuestRequest
};