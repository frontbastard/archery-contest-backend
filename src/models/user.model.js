const mongoose = require('mongoose');

const { Schema } = mongoose;
const validator = require('validator');
const bcrypt = require('bcryptjs');
const uniqueValidator = require('mongoose-unique-validator');
const jwt = require('jsonwebtoken');
const { MODEL, ROLE, ERROR_CODE } = require('../common/constants');
// const {ContestModel} = require('./contest.model');

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 30,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      minlength: 2,
      maxlength: 30,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error(`${value} is not a valid email`);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (
          !validator.isStrongPassword(value, {
            minLength: 8,
            maxlength: 30,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
          })
        ) {
          throw new Error('Please choose a stronger password');
        }
      },
    },
    dateOfBirth: {
      type: Date || null,
      trim: true,
      default: null,
    },
    blocked: {
      type: Boolean || null,
      default: false,
      immutable: (doc) => doc.role === 1,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    role: {
      type: Number,
      required: true,
      default: 4,
      enum: Object.values(ROLE),
      immutable: (doc) => doc.role === ROLE.Master,
    },
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

// userSchema.index({ name: 'text', description: 'text' });
// userSchema.virtual('contests', {
//   ref: MODEL.Contest,
//   localField: '_id',
//   foreignField: 'owner',
// });

userSchema.plugin(uniqueValidator);

// Get public profile
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

// Generate auth token
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// Check user password
userSchema.statics.findByCredentials = async (email, password) => {
  // eslint-disable-next-line no-use-before-define
  const user = await UserModel.findOne({ email });

  if (!user) {
    return null;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return null;
  }

  return user;
};

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

userSchema.pre('remove', async function (next) {
  const user = this;

  if (user.role === ROLE.Master) {
    next(new Error('Master is non-removable'));
  }
  // await ContestModel.deleteMany({ owner: user._id });

  next();
});

const UserModel = mongoose.model(MODEL.User, userSchema);

module.exports = UserModel;
