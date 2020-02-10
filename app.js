const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
// Router modules
const tourRouter = require(`./routes/tourRoutes`);
const userRouter = require(`./routes/userRoutes`);

const app = express();

// Third Party Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Only run logging in development
}
app.use(express.json());

// Serving static files
app.use(express.static(`${__dirname}/public`));

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
