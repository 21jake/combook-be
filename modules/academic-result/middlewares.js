const catchAsyncError = require('../../utils/catchAsyncError');

const bindTchrSbjctToReqQuery = catchAsyncError(async (req, res, next) => {
  const { subject } = req.user;
  if (subject) req.query.subject = subject._id;
  next();
});

module.exports = { bindTchrSbjctToReqQuery };
