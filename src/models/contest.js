const mongoose = require('mongoose');
// const validator = require('validator');

const Contest = mongoose.model('Contest', {
  id: { type: Number},
  name: { type: String, required: true, minlength: 2, trim: true },
  description: { type: String, trim: true, default: '' },
});

module.exports = Contest;
