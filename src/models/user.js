const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const uniqueValidator = require('mongoose-unique-validator');
const jwt = require('jsonwebtoken');
const {
  tokenSecret,
  tokenExpiresIn,
  contestRef,
} = require('../common/constants');
const Contest = require('../models/contest');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, trim: true },
  email: {
    type: String,
    unique: true,
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
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

userSchema.virtual('contests', {
  ref: contestRef,
  localField: '_id',
  foreignField: 'owner',
});

userSchema.plugin(uniqueValidator);

// Get public profile
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

// Generate auth token
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, tokenSecret, {
    expiresIn: tokenExpiresIn,
  });

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// Check user password
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
};

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
  const user = this;
  console.log(user)

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
  const user = this;
console.log(user)
  await Contest.deleteMany({ owner: user._id });

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
