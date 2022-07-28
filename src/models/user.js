const mongoose = require('mongoose');
const validator = require('validator');

const User = mongoose.model('User', {
  id: { type: Number},
  email: {
    type: String,
    required: true,
    minlength: 2,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    },
  },
  name: { type: String, required: true, minlength: 2, trim: true },
  password: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.isStrongPassword(value)) {
        throw new Error('Please choose a stronger password');
      }
    },
  },
  age: {
    type: Number,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be a positive number');
      }
    },
    default: 0,
  },
  blocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: new Date() },
});

module.exports = User;
