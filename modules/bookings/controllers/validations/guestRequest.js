const yup = require('yup');

const sortOptions = {
  newest: { column: 'created_at', direction: 'DESC' },
  oldest: { column: 'created_at', direction: 'ASC' },
  first_name_asc: { column: 'first_name', direction: 'ASC' },
  first_name_desc: { column: 'first_name', direction: 'DESC' },
  last_name_asc: { column: 'last_name', direction: 'ASC' },
  last_name_desc: { column: 'last_name', direction: 'DESC' },
};

const validateGetAllGuestsRequest = async (form) => {
  const formShape = {
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