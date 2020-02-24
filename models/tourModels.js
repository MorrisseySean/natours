const mongoose = require('mongoose');
const slugify = require('slugify');
// eslint-disable-next-line no-unused-vars
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, `A tour must have a name`],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have 40 or less characters.'],
      minlength: [10, 'A tour name must have 10 or more characters.']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, `A tour must have a price`]
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message:
          'Discount price ({VALUE}) should not be lower than regular price.'
      }
    },
    summary: {
      type: String,
      trim: true, // Removes all whitespace at the beginning and end of the String
      required: [true, 'A tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// Get related reviews using virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// Document Middleware
// pre || Runs before save or create command. !insertMany()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

/*
// NOTE: Leftover code left in as example
// Embed users in the tours model/tourSchema.pre('save', async function(next) {
const guidesPromises = this.guides.map(async id => await User.findById(id));
    this.guides = await Promise.all(guidesPromises);
    next();
}); 
*/

// Query Middleware
// Remove secret tours from the default query
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// Populate the guides user references
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

// NOTE: Placeholder
tourSchema.post(/^find/, function(docs, next) {
  next();
});

// Aggregation Middleware
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
