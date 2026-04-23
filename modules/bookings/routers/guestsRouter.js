const { Router } = require('express');
const {
  getAllGuests,
  createGuest,
  getGuest,
  updateGuest
} = require('../controllers/guestsController');

const guestsRouter = Router();

guestsRouter.get('/', getAllGuests);
guestsRouter.post('/', createGuest);
guestsRouter.get('/:id', getGuest);
guestsRouter.patch('/:id', updateGuest);

module.exports = guestsRouter;