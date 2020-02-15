const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = err => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value}, Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join(' ')}`;
  return new AppError(message, 400);
};
const handleJWTError = () =>
  new AppError('Invalid login token. Please log in again.', 401);

const handleJWTExpired = () =>
  new AppError('Your login has timed out. Please log in again.', 401);

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    stack: err.stack,
    message: err.message
  });
};

const sendProdError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming or unknown errors. Don't leak to users.
    // 1) Log error
    // eslint-disable-next-line no-console
    console.error('ERROR 💥', err);
    // 2) Send message to user
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong! Please contact the webmaster.'
    });
  }
};

module.exports = (err, req, res, next) => {
  // Set defaults
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // Manage Mongoose errors
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpired();
    sendProdError(error, res);
  }
};
