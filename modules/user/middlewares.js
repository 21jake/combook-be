const catchAsyncError = require('../../utils/catchAsyncError');

const bindUserIdToReqParams = catchAsyncError(async (req, res, next) => {
  const { id } = req.user;
  req.params._id = id;
  next();
});

module.exports = { bindUserIdToReqParams };
