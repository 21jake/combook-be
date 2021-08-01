const ApplicationError = require('../utils/appError');
const catchAsyncError = require('../utils/catchAsyncError');
const { verify } = require('jsonwebtoken');
const User = require('../modules/user/model');

const { JWT_SECRET } = process.env;

const authenticate = catchAsyncError(async (req, res, next) => {
  // 1) CHECK TOKEN EXISTS
  // const token = req.headers.authorization;
  let token;
  const { jwt } = req.cookies;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (jwt) {
    token = jwt;
  }

  if (!token) {
    return next(new ApplicationError("User hasn't logged in", 401));
  }

  // 2) TOKEN VERIFICATION
  const decoded = await verify(token, JWT_SECRET);
  const { id, iat } = decoded;
  const user = await User.findById(id);

  // 3) CHECK IF USER STILL EXISTS
  if (!user) {
    const message = 'No user associates with this authentication token';
    return next(new ApplicationError(message, 401));
  }

  // 4) IF USER CHANGE PASSWORD AFTER TOKEN WAS ISSUED
  const pwdChangedAfterUserLoggin = user.passwordChangedAfterTokenIssued(iat);
  if (pwdChangedAfterUserLoggin) {
    const message = 'User recently changed the password, please loggin again';
    return next(new ApplicationError(message, 401));
  }

  // 5) Grant access to protected routes
  req.user = user;
  res.locals.user = user;
  next();
});

module.exports = authenticate;
