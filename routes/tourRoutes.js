const express = require('express');
const tourController = require('./../controllers/tourController');

// Declare router
const router = express.Router();

// Param middleware
router.param('id', tourController.checkID);

//Check if body contains the name, and price properties.
const checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Incorrect parameters'
    });
  }
  next();
};

// Tours routes
router
  .route('/')
  .get(tourController.getAllTours)
  .post(checkBody, tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
