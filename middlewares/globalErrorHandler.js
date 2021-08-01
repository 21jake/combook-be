const AppError = require('../utils/appError');
const sendErrorForDev = (error, req, res) => {
  const { statusCode, status, message, stack } = error;

  // console.log(req.originalUrl.startsWith('/api '), 'req.originalUrl');
  if (req.originalUrl.startsWith('/api')) {
    // API
    res.status(statusCode).json({
      status,
      message,
      stack,
      error,
    });
  } else {
    // RENDERING WEBSITE
    res.status(statusCode).render('error', {
      title: 'Something went wrong',
      message,
    });
  }
};
const sendErrorForProd = (error, req, res) => {
  // KNOWN ERROR: operational, trusted error: send message to client
  const { statusCode, status, message, isOperational } = error;

  if (req.originalUrl.startsWith('/api')) {
    // 1. RETURN JSON ERRORS
    if (isOperational) {
      return res.status(statusCode).json({
        status,
        message,
      });
    }
    // UNKNOWN ERROR: programming or unknow error: don't leak other details
    res.status(500).json({
      status,
      message: 'SOMETHING WENT WRONG',
    });
  } else {
    // 2. RENDERING ERROR PAGE
    res.status(statusCode).render('error', {
      title: 'Something went wrong',
      message: isOperational ? message : 'Unknown error, please contact administrator',
    });
  }
};

const handleCastErrorDB = (error) => {
  const { path, value } = error;
  const message = `Invalid ${path}: ${value}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((element) => element.message);
  const message = `Invalid input: ${errors.join(', ')}`;
  return new AppError(message, 400);
};
const handleDuplicateInputError = (error) => {
  const dupField = error.keyValue.name;
  const message = `Duplicate field value: ${dupField}, please use another value`;
  return new AppError(message, 400);
};
const handleJsonWebTokenError = () => {
  const message = `Invalid authentication token, please loggin again`;
  return new AppError(message, 401);
};
const handleTokenExpiredError = () => {
  const message = `Authentication token expired, please loggin again`;
  return new AppError(message, 401);
};

const errorMiddleware = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(error, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let prodError = {
      ...error,
      message: error.message,
      name: error.name,
      code: error.code,
    };

    const { name, code } = prodError;
    if (name === 'CastError') {
      prodError = handleCastErrorDB(prodError);
    }
    if (name === 'ValidationError') {
      prodError = handleValidationErrorDB(prodError);
    }
    // DUPLICATE INPUT FOR UNIQUE FIELDS  - MONGOOSE ERROR
    if (code === 11000) {
      prodError = handleDuplicateInputError(prodError);
    }
    if (name === 'JsonWebTokenError') {
      prodError = handleJsonWebTokenError();
    }
    if (name === 'TokenExpiredError') {
      prodError = handleTokenExpiredError();
    }

    sendErrorForProd(prodError, req, res);
  }
};

module.exports = errorMiddleware;
