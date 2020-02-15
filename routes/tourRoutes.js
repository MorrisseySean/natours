const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

// Declare router
const router = express.Router();

// Param middleware
//router.param('id', tourController.checkID);

// Alias
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

// Pipeline aggregation
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

// Tours routes
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    tourController.deleteTour
  );

module.exports = router;
