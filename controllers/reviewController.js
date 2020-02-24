const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');

exports.setTourId = (req, res, next) => {
  if (req.params.tourId) req.body.tour = req.params.tourId;
  req.body.user = req.user.id;
  next();
};

exports.checkUser = (req, res, next) => {
  const curReview = Review.findById(req.params.id);
  if (req.user.role !== 'admin' && curReview.user !== req.user.id) {
    return next(
      new AppError(401, 'You do not have permission to perform this action.')
    );
  }
  next();
};

// Factory functions
exports.getReview = factory.getOne(Review);
exports.getAllReviews = factory.getAll(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
