const router = require('express').Router({ mergeParams: true });


const {
  getEntities,
  getEntity,
  createEntity,
  updateEntity,
  removeEntity,
} = require('./controller');

router
  .route('/')
  .get(getEntities)
  .post(createEntity);
router
  .route('/:_id')
  .get(getEntity)
  .delete(removeEntity)
  .patch(updateEntity);

module.exports = router;
