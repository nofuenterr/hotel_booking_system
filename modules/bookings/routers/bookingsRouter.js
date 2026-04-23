const { Router } = require('express');
const {
  getAllGuestBookings, 
  getAllBookings, 
  createBooking, 
  getBooking, 
  updateBooking, 
  cancelBooking 
} = require('../controllers/bookingsController');

const bookingsRouter = Router();

bookingsRouter.get('/guest/:guest_id', getAllGuestBookings);
bookingsRouter.get('/', getAllBookings);
bookingsRouter.post('/', createBooking);
bookingsRouter.get('/:id', getBooking);
bookingsRouter.patch('/:id', updateBooking);
bookingsRouter.delete('/:id', cancelBooking);

module.exports = bookingsRouter;