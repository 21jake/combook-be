const ApplicationError = require('../utils/appError');

const checkRoles = (...roles) => (req, res, next) => {
  const { role } = req.user;
  if (!roles.includes(role)) {
    return next(
      new ApplicationError('Insufficient permissons for requested action', 403)
    );
  } else {
    next();
  }
};

module.exports = checkRoles;
