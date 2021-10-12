const router = require('express').Router();

// const authenticate = require('../../middlewares/authenticate');
// const checkRoles = require('../../middlewares/checkRoles');
const {
  getEntities,
  getEntity,
  createEntity,
  updateEntity,
  removeEntity,
  getCheckoutSession,
} = require('./controller');

// router.use(authenticate);
// router.get('/checkout-session/:tourId', getCheckoutSession);

// router.use(checkRoles('admin'));

router
  .route('/')
  .get(getEntities)
  .post(createEntity);
router
  .route('/:_id')
  .get(getEntity)
  .delete(removeEntity)
  .patch(updateEntity);
router.route('/checkout-session/:_id').get(getCheckoutSession);

module.exports = router;
