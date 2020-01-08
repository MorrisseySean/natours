const express = require('express');
const morgan = require('morgan');

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

module.exports = app;
