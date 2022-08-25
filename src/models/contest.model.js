const mongoose = require('mongoose');

const { Schema } = mongoose;
const { MODEL } = require('../common/constants');
// const validator = require('validator');

const CONTEST_FIELDS = ['name', 'description', 'hidden'];

const contestSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },
    description: { type: String, trim: true, default: '' },
    hidden: { type: Boolean, default: false },
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: MODEL.User,
    },
  },
  {
    timestamps: true,
  }
);

const ContestModel = mongoose.model(MODEL.Contest, contestSchema);

module.exports = { ContestModel, CONTEST_FIELDS };
