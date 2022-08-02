const mongoose = require('mongoose');
const { MODEL } = require('../common/constants');
// const validator = require('validator');

const contestSchema = new mongoose.Schema(
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
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: MODEL.USER,
    },
  },
  {
    timestamps: true,
  }
);

const ContestModel = mongoose.model(MODEL.CONTEST, contestSchema);

module.exports = ContestModel;
