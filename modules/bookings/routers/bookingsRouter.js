const { Router } = require('express');

const bookingsRouter = Router();

bookingsRouter.get('/guest/:guest_id', (req, res, next) => {
  res.status(200).json({ info: `Retrieved all bookings for guest with id #${req.params.guest_id}` });
});
bookingsRouter.get('/', (req, res, next) => {
  res.status(200).json({ info: 'Retrieved all bookings' });
});
bookingsRouter.post('/', (req, res, next) => {
  res.status(201).json({ info: 'Created new booking' });
});
bookingsRouter.get('/:id', (req, res, next) => {
  res.status(200).json({ info: `Retrieved booking with id #${req.params.id}` });
});
bookingsRouter.patch('/:id', (req, res, next) => {
  res.status(200).json({ info: `Updated booking status with id #${req.params.id}` });
});
bookingsRouter.delete('/:id', (req, res, next) => {
  res.status(200).json({ info: `Cancelled booking with id #${req.params.id}` });
 });

module.exports = bookingsRouter;