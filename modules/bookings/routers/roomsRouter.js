const { Router } = require('express');
const {
  getAllRooms,
  createRoom,
  getRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomsController.js');

const roomsRouter = Router();

roomsRouter.get('/', getAllRooms);
roomsRouter.post('/', createRoom);
roomsRouter.get('/:id', getRoom);
roomsRouter.patch('/:id', updateRoom);
roomsRouter.delete('/:id', deleteRoom);

module.exports = roomsRouter;