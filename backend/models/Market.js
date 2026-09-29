const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    district: String,
    state: { type: String, default: 'Tamil Nadu' },
    latitude: Number,
    longitude: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Market', marketSchema);
