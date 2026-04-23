const { Router } = require('express');
const guestsRouter = require('../modules/bookings/routers/guestsRouter.js');
const roomsRouter = require('../modules/bookings/routers/roomsRouter.js');
const bookingsRouter = require('../modules/bookings/routers/bookingsRouter.js');

const router = Router();

router.use('/guests', guestsRouter);
router.use('/rooms', roomsRouter);
router.use('/', bookingsRouter);

module.exports = router;