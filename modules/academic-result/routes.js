const router = require('express').Router();
const authenticate = require('../../middlewares/authenticate');
const { bindTchrSbjctToReqQuery } = require('./middlewares');
const checkRoles = require('../../middlewares/checkRoles');

const {
  getEntities,
  getEntity,
  createEntity,
  updateEntity,
  removeEntity,
} = require('./controller');

router.use(authenticate, checkRoles("admin", "teacher"), bindTchrSbjctToReqQuery);

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
