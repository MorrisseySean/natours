const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
// Router modules
const tourRouter = require(`./routes/tourRoutes`);
const userRouter = require(`./routes/userRoutes`);

const app = express();
// Third Party Middleware
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Only run logging in development
}

// Limit requests to the API
const limiter = rateLimit({
  // Only allow 100 requests per hour per IP
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again later.'
});
app.use('/api', limiter);

// Body parser, reading data in to req.body
app.use(express.json({ limit: `10kb` }));

// Data sanitization against noSQL query injection
app.use(mongoSanitize());

//Data sanitization against HTML XSS attacks
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Mounting router middleware on specific routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handle any uncaught routes.
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Error handling middleware
app.use(globalErrorHandler);

module.exports = app;
