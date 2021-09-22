const catchAsyncError = require('../../utils/catchAsyncError');

const bindTchrSbjctToReqQuery = catchAsyncError(async (req, res, next) => {
  const { subject } = req.user;
  if (subject) req.query.subject = subject._id;
  next();
});

const bindStudntIdToReqQuery = catchAsyncError(async (req, res, next) => {
  const { role, id } = req.user;
  if (role === "student") req.query.student = id;
  next();
});

module.exports = { bindTchrSbjctToReqQuery, bindStudntIdToReqQuery };
