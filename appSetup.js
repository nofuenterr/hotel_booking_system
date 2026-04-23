const express = require('express');
const routes = require('./routers/bookingsRouter.js');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', (req, res, next) => {
  console.log('Welcome to hotel booking system!');
  next();
});

app.use('/bookings', routes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});
app.use((err, _req, res) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;