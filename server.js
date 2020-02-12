/* eslint-disable no-console */
// Define environment variables from file
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Catch any unexpected exceptions
process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION: Shutting down...');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  'PASSWORD',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful'));

// Start express application on port 3000
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// Handle unhandled promise rejections anywhere in the server.
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION: Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
