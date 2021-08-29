const router = require('express').Router();

const authenticate = require('../../middlewares/authenticate');
const checkRoles = require('../../middlewares/checkRoles');
const {
  signUp,
  login,
  resetPassword,
  forgotPassword,
  updatePassword,
  updateInfo,
  deactivate,
  logout,
  verify,
  generateResultRecords
} = require('./authentication');

const { getEntities, removeEntity, getEntity, updateEntity } = require('./controller');
const { bindUserIdToReqParams } = require('./middlewares');

// Only admin can create new account
router.post('/sign-up', authenticate, checkRoles('admin'), signUp, generateResultRecords);
router.get('/verify', authenticate, verify);

router.post('/login', login);
router.get('/logout', authenticate, logout);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.use(authenticate);
// ALL ROUTES BELOW ARE AUTHENTICATED

router.route('/me').get(bindUserIdToReqParams, getEntity);
router.route('/').get(checkRoles('admin'), getEntities);

router
  .route('/:_id')
  .delete(checkRoles('admin'), removeEntity)
  .patch(checkRoles('admin'), updateEntity)
  .get(getEntity);

router.patch('/update-password', updatePassword);
router.patch('/update-info', updateInfo);
router.patch('/deactivate', deactivate);

module.exports = router;
