const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// name email photo password passwordConfirm
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name.'],
    unique: [true, 'Username must be unique.'],
    trim: true,
    minlength: [4, 'Usernames must be more than 4 characters.'],
    maxlength: [16, 'Usernames must be no more than 16 characters.']
  },
  email: {
    type: String,
    required: [true, 'Please enter your email address.'],
    unique: [true, 'Email is already registered.'],
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please enter a valid email address.']
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please enter a password.'],
    minLength: [8, 'Passwords must be more than 8 characters.'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password.'],
    minLength: [8, 'Confirmation password too short.'],
    validate: {
      // Only functional for SAVE method
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same'
    }
  },
  passwordChangedAt: Date
});

userSchema.pre('save', async function(next) {
  // Only run if password is being modified
  if (!this.isModified('password')) return next();
  // Hash the password with a CPU cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete password confirm field
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPassword = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
