const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  url: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
