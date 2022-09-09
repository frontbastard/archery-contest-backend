const mongoose = require('mongoose');

const { Schema } = mongoose;
const { MODEL } = require('../common/constants');
// const validator = require('validator');

const contestSchema = new Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
    },
    name: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },
    description: { type: String, trim: true, default: '' },
    hidden: { type: Boolean || null, default: false },
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: MODEL.User,
    },
    ownerName: {
      type: String,
      required: true,
      ref: MODEL.User,
    },
  },
  {
    timestamps: true,
  }
);

contestSchema.methods.toJSON = function () {
  const contest = this;
  const contestObject = contest.toObject();

  contestObject.id = contestObject._id;
  delete contestObject._id;
  return contestObject;
};

const ContestModel = mongoose.model(MODEL.Contest, contestSchema);

module.exports = ContestModel;
