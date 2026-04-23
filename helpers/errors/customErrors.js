class NotFoundError extends Error {
  statusCode = 404;
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
};

class BadRequestError extends Error {
  statusCode = 400;
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
  }
};

class UnauthorizedError extends Error {
  statusCode = 401;
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
  }
};

class ForbiddenError extends Error {
  statusCode = 403;
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
  }
};

module.exports = { NotFoundError, BadRequestError, UnauthorizedError, ForbiddenError };