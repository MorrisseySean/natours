// review message / rating / createdAt / tour Reference / user Reference
const mongoose = require('mongoose');

const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty']
    },
    rating: {
      type: Number,
      default: 3,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtual: true },
    toObject: { virtual: true }
  }
);

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

// Calculate and update the ratings for the given tour
reviewSchema.statics.calcAvgRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

// Update the ratings when a review is updated and deleted.
// NOTE: findOneAnd is a query, and does not have access to calcAvgRatings.
// NOTE: Run findOne on the query to access review object and pass it to post middleware
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.curReview = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function() {
  await this.curReview.constructor.calcAvgRatings(this.curReview.tour);
});

// Update the ratings of a tour after a review is created
reviewSchema.post('save', function() {
  this.constructor.calcAvgRatings(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
