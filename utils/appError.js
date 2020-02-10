class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // Check the type of error before setting the status
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // Checking to make sure it's not a Programming error
    this.isOperational = true;

    // Removing the contructor from the Error stack
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
