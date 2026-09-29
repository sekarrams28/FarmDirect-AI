const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fpo: { type: mongoose.Schema.Types.ObjectId, ref: 'FPO', default: null },
    village: String,
    district: String,
    state: { type: String, default: 'Tamil Nadu' },
    location: {
      latitude: Number,
      longitude: Number,
    },
    landSizeAcres: Number,
    primaryCrops: [String],
  },
  { timestamps: true }
);

farmerSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

module.exports = mongoose.model('Farmer', farmerSchema);
