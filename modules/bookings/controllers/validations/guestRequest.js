const yup = require('yup');

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
  };

  const schema = yup.object().shape(formShape);
  return schema.validate(form, { abortEarly: false, strict: true });
};

const validateUpdateGuestRequest = (form) => {
  const formShape = {
    first_name: yup.string().required(),
    last_name: yup.string().required(),
    email: yup.string().email('invalid email address').required(),
    phone: yup.string()
  };

  const schema = yup.object().shape(formShape);
  return schema.validate(form, { abortEarly: false, strict: true });
};

module.exports = {
  validateCreateGuestRequest,
  validateGetGuestRequest,
  validateUpdateGuestRequest
};