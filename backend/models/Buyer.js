const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: String,
    buyerType: { type: String, enum: ['retailer', 'wholesaler', 'exporter', 'processor', 'individual'], default: 'retailer' },
    location: {
      district: String,
      state: { type: String, default: 'Tamil Nadu' },
      latitude: Number,
      longitude: Number,
    },
    preferredCrops: [String],
    monthlyVolumeKg: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Buyer', buyerSchema);
