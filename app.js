const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const globalErrorHandler = require('./middlewares/globalErrorHandler');
const AppError = require('./utils/appError');
const gradeRouter = require('./modules/grade/routes');
const classRouter = require('./modules/class/routes');
const userRouter = require('./modules/user/routes');
const dummyRouter = require('./modules/dummy/routes');

const app = express();

app.enable('trust proxy');

// Serves static data
app.use(express.static(path.join(__dirname, 'public')));

// GLOBAL MIDDLEWARES

// 1. Set security HTTP headers && cors

app.use(cors()); //Acess-Control-Allow-Origin *
// app.use(cors({
//   origin: "https.foobar.com" // Only for specific domain
// }))

app.options('*', cors()); // Pre-flight phase
// app.options('/api/v1/tours:/id', cors()) // Only on this route

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// 2. Show concise output colored by response status for development use
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 3. Parses json in request body
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 5. Limit number of requests from one IPs
const limiter = rateLimit({
  // 100 requests every one hour for one IP
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again',
});

app.use('/api/', limiter); // ONLY APPLY LIMITER WITH APIs ROUTES

// 6. DATA sanitization against NOSQL query injection
app.use(mongoSanitize());

// 7. DATA sanitization against XSS
app.use(xssClean());

// 8. PREVENT PARAMETER POLLUTION
// app.use(
//   hpp({
//     whitelist: [
//       'duration',
//       'ratingsAverage',
//       'ratingsQuantity',
//       'maxGroupSize',
//       'price'
//     ]
//   })
// );

// 9. RESPONSE COMPRESSION
app.use(compression());

// ROUTING
const prefix = `/api/v1`;
app.use(`${prefix}/grades`, gradeRouter);
app.use(`${prefix}/classes`, classRouter);
app.use(`${prefix}/users`, userRouter);
app.use(`${prefix}/dummy`, dummyRouter);

// UNHANDLED ROUTE
app.all(`*`, (req, res, next) => {
  const err = new AppError(`can't find ${req.originalUrl}`, 404);

  // WHEN PASS AN ARGUMENT TO NEXT(), EXPRESS ASSUMES IT'S AN ERROR
  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
