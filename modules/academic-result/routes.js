const router = require('express').Router();
const authenticate = require('../../middlewares/authenticate');
const { bindTchrSbjctToReqQuery, bindStudntIdToReqQuery } = require('./middlewares');
const checkRoles = require('../../middlewares/checkRoles');

const {
  getEntities,
  getEntity,
  createEntity,
  updateEntity,
  removeEntity,
} = require('./controller');

router.use(authenticate, bindTchrSbjctToReqQuery, bindStudntIdToReqQuery);

router
  .route('/')
  .get(getEntities);

router.use(checkRoles("admin", "teacher"));

router
  .route('/')
  .post(createEntity);
router
  .route('/:_id')
  .get(getEntity)
  .delete(removeEntity)
  .patch(updateEntity);

module.exports = router;
