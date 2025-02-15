const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose'); // Import mongoose
require('dotenv').config(); // To load environment variables from .env file
const getUserdataRouter=require('./routes/getUserDetails')
const addCostItem = require('./routes/addCostItem')
const developersTeamRouter = require('./routes/getDeveloperTeamMembers');
const reportRouter = require('./routes/getReport');
const usersRouter = require('./routes/users');
const indexRouter = require('./routes/index');

const app = express();

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully!');
  }
  catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the process with failure
  }
};

connectDB();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
/**
 * Set up routes
 */
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/about', developersTeamRouter);
app.use('/api/users', getUserdataRouter);
app.use('/api/add', addCostItem);
app.use('/api/report', reportRouter);


/**
 * Catch 404 errors and return JSON response.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

/**
 * Global error handler.
 * Logs errors and returns JSON response with appropriate status code.
 *
 * @param {Error} err - The error object.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});


module.exports = app;
