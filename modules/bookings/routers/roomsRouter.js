const { Router } = require('express');

const roomsRouter = Router();

roomsRouter.get('/', (req, res, next) => {
  res.status(200).json({ info: 'Retrieved all rooms' });
});
roomsRouter.post('/', (req, res, next) => {
  res.status(201).json({ info: 'Created new room' });
});
roomsRouter.get('/:id', (req, res, next) => {
  res.status(200).json({ info: `Retrieved room with id #${req.params.id}` });
});
roomsRouter.patch('/:id', (req, res, next) => {
  res.status(200).json({ info: `Updated room details with id #${req.params.id}` });
});
roomsRouter.delete('/:id', (req, res, next) => {
  res.status(200).json({ info: `Deleted room with id #${req.params.id}` });
});

module.exports = roomsRouter;