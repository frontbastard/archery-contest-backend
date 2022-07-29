const mongoose = require('mongoose');
const { userRef } = require('../common/constants');
// const validator = require('validator');

const contestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 2, trim: true },
    description: { type: String, trim: true, default: '' },
    hidden: {type: Boolean, default: false},
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: userRef,
    },
  },
  {
    timestamps: true,
  }
);

const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest;
