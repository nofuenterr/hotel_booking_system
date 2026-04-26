const express = require('express');
const moment = require('moment');
const routes = require('./routers/bookingsRouter.js');
const { fetchWeatherForDate } = require('./helpers/services/weatherService.js');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/', (req, res, next) => {
  console.log('Welcome to hotel booking system!');
  next();
});

app.use('/bookings', routes);

app.get('/weather/today', async (req, res, next) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const data = await fetchWeatherForDate(today);
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, _req, res, next) => {
  console.error(err);

  // Yup validation errors
  if (err?.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      errors: err?.errors || []
    });
  };

  // Custom errors (NotFoundError, BadRequestError, etc.)
  if (err?.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  };

  // PostgreSQL connection failures
  if (err?.code === '08006' || err?.code === '08001') {
    return res.status(503).json({
      success: false,
      error: 'Database connection failed. Please try again later.'
    });
  };

  // Table doesn't exist (migrations not run)
  if (err?.code === '42P01') {
    return res.status(500).json({
      success: false,
      error: 'Database table not found. Please run migrations.'
    });
  };

  // Invalid date format
  if (err?.code === '22007') {
    return res.status(400).json({
      success: false,
      error: 'Invalid date format provided.'
    });
  };

  // Invalid input syntax
  if (err?.code === '22P02') {
    return res.status(400).json({
      success: false,
      error: 'Invalid input syntax.'
    });
  };

  // Unhandled PostgreSQL errors
  if (err?.code) {
    return res.status(500).json({
      success: false,
      error: 'An unexpected database error occurred.'
    });
  };

  // Generic fallback
  return res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;