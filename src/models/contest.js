const mongoose = require('mongoose');
const {userRef} = require('../common/constants')
// const validator = require('validator');

const Contest = mongoose.model('Contest', {
  name: { type: String, required: true, minlength: 2, trim: true },
  description: { type: String, trim: true, default: '' },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: userRef
  },
});

module.exports = Contest;
