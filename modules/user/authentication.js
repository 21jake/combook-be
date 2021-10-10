const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./model');
const AppError = require('../../utils/appError');
const catchAsyncError = require('../../utils/catchAsyncError');
const Email = require('../../utils/email');
const filterFields = require('../../utils/filterFields');
const Subject = require('../subject/model');
const Semester = require('../semester/model');
const Result = require('../academic-result/model');
const APIFeatures = require('../../utils/apiFeatures');

const { JWT_SECRET, JWT_EXPIRATION, JWT_COOKIE_EXPIRATION, NODE_ENV } = process.env;
const signToken = id => {
  const token = jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
  return token;
};

const sendTokenResponse = (res, token, code, user, req) => {
  const cookieOptions = {
    // CONVERT DAY TO MILLISECOND
    expires: new Date(Date.now() + JWT_COOKIE_EXPIRATION * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  // NOT ALL PRODUCTION ENV IS SECURED
  // if (NODE_ENV === 'production') {
  //   cookieOptions.secure = true;
  // }

  res.cookie('jwt', token, cookieOptions);

  // REMOVE PASSWORD FROM OUTPUT
  user.password = undefined;
  res.status(code).json({ success: true, token, data: { user } });
};

const signUp = catchAsyncError(async (req, res, next) => {
  const {
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
    role,
    subject,
    _class,
  } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
    role,
    subject,
    _class,
  });

  const url = `${req.protocol}://${req.get('host')}/#/info`;
  console.log(url, 'url');
  await new Email(user, url).sendWelcome();

  // const token = signToken(user._id);
  // sendTokenResponse(res, token, 201, user, req);
  req.newUser = user;
  next();
});

const resultPromise = (student, semester, subject) => {
  return new Promise((resolve, reject) => {
    Result.create({ student, semester, subject })
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
};

const generateResultRecords = catchAsyncError(async (req, res, next) => {
  const { newUser: user } = req;

  if (user.role !== 'student') {
    return res.status(201).json({ success: true, data: { user } });
  }

  const subjectQuery = new APIFeatures(Subject.find(), undefined);
  const semesterQuery = new APIFeatures(Semester.find(), undefined);

  const subjects = (await subjectQuery.query).map(({ _id }) => _id);
  const semesters = (await semesterQuery.query).map(({ _id }) => _id);

  const resultPromises = [];

  for (let i = 0; i < subjects.length; i++) {
    for (let j = 0; j < semesters.length; j++) {
      resultPromises.push(resultPromise(user.id, semesters[j], subjects[i]));
    }
  }

  await Promise.all(resultPromises);

  res.status(201).json({ success: true, data: { user } });
});

const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  // CHECK EMAIL & PASSWORD EXIST
  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  // CHECK IF USER EXISTS & PASSWORD CORRECT
  const user = await User.findOne({
    email,
  }).select('+password');

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  const token = signToken(user._id);
  sendTokenResponse(res, token, 200, user, req);
  // res.status(200).json({ success: true, token });
});

const forgotPassword = catchAsyncError(async (req, res, next) => {
  // GET USER BASED ON EMAIL
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Email is required', 400));
  }
  const user = await User.findOne({
    email,
  });
  if (!user) {
    return next(new AppError('No user associates with the email provided', 404));
  }

  // GENERATE RANDOM TOKEN
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // SEND TOKEN BACK AS AN EMAIL

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/reset-password/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      success: true,
      message: 'Token sent to email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was a problem reseting your password. Try again later', 500)
    );
  }
});

const resetPassword = catchAsyncError(async (req, res, next) => {
  // GET USER BASED ON THE TOKEN
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm) {
    return next(new AppError('Pasword and passwordConfirm are required', 400));
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new AppError('Invalid token or token has expired, please try again', 400)
    );
  }

  // SET NEW PASSWORD (IF TOKEN NOT EXPIRED)
  // UPDATE CHANGEPASSWORDAT
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // LOG USER IN (SEND JWT BACK)

  const newToken = signToken(user._id);
  sendTokenResponse(res, newToken, 200, user, req);
  // res.status(200).json({ success: true, token: newToken });
});

const updatePassword = catchAsyncError(async (req, res, next) => {
  const { currentPassword, password, passwordConfirm } = req.body;
  const { id } = req.user;

  if (!currentPassword || !password || !passwordConfirm) {
    return next(
      new AppError('currentPassword, password, passwordConfirm are required', 400)
    );
  }

  // GET USER
  const user = await User.findById(id).select('+password');

  // CHECK CURRENT PASSWORD IS CORRECT
  if (!user || !(await user.comparePassword(currentPassword, user.password))) {
    return next(new AppError('Incorrect id or password!', 401));
  }

  // CHANGE PASSWORD
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  // LOG USER IN (SEND JWT BACK)
  const token = signToken(user._id);
  sendTokenResponse(res, token, 200, user, req);
  // res.status(200).json({ success: true, token });
});

const updateInfo = catchAsyncError(async (req, res, next) => {
  const { currentPassword, password, passwordConfirm } = req.body;
  const { id } = req.user;

  if (password || passwordConfirm) {
    return next(
      new AppError(
        'This route doesnt support password update, please use PATCH users/update-password',
        400
      )
    );
  }

  if (!currentPassword) {
    return next(new AppError('currentPassword are required', 400));
  }

  // GET USER
  const user = await User.findById(id).select('+password');

  // CHECK CURRENT PASSWORD IS CORRECT
  if (!user || !(await user.comparePassword(currentPassword, user.password))) {
    return next(new AppError('Incorrect id or password!', 401));
  }

  // FIlter out fields name we dont want user to update
  const allowedFields = ['name', 'email'];
  const filteredBody = filterFields(req.body, allowedFields);

  // UPDATE DATA

  const updated = await User.findByIdAndUpdate(id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: {
      user: updated,
    },
  });
});

const deactivate = catchAsyncError(async (req, res, next) => {
  const { id } = req.user;
  await User.findOneAndUpdate(id, { active: false });

  res.status(200).json({ success: true, message: 'Account successfully deactivated' });
});

const verify = catchAsyncError(async (req, res, next) => {
  const { user } = req;
  res.status(200).json({ success: true, data: { user } });
});

const logout = async (req, res, next) => {
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Loggout successfully' });
};

module.exports = {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateInfo,
  deactivate,
  logout,
  verify,
  generateResultRecords,
};
