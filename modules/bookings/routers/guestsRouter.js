const { Router } = require('express');

const guestsRouter = Router();

guestsRouter.get('/', (req, res, next) => {
  res.status(200).json({ info: 'Retrieved all guests' });
});
guestsRouter.post('/', (req, res, next) => {
  res.status(201).json({ info: 'Created new guest' });
});
guestsRouter.get('/:id', (req, res, next) => {
  res.status(200).json({ info: `Retrieved guest with id #${req.params.id}` });
});
guestsRouter.patch('/:id', (req, res, next) => {
  res.status(200).json({ info: `Updated guest details with id #${req.params.id}` });
});

module.exports = guestsRouter;