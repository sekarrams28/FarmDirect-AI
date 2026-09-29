const mongoose = require('mongoose');

const produceSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
    fpo: { type: mongoose.Schema.Types.ObjectId, ref: 'FPO', default: null },
    crop: { type: String, required: true, trim: true },
    variety: String,
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, enum: ['kg', 'quintal', 'tonne'], default: 'kg' },
    askingPrice: { type: Number, required: true },
    location: {
      village: String,
      district: String,
      state: { type: String, default: 'Tamil Nadu' },
      latitude: Number,
      longitude: Number,
    },
    harvestDate: Date,
    availableFrom: { type: Date, default: Date.now },
    images: [String],
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold', 'expired'],
      default: 'available',
    },
    // Cached AI outputs so the marketplace UI doesn't have to call the AI
    // service on every page render.
    lastDemandPrediction: {
      predictedDemandKg: Number,
      trend: String,
      forecastDays: Number,
      computedAt: Date,
    },
    lastPricePrediction: {
      recommendedMin: Number,
      recommendedMax: Number,
      bestBuyerPrice: Number,
      recommendation: String,
      computedAt: Date,
    },
  },
  { timestamps: true }
);

produceSchema.index({ crop: 1, status: 1 });
produceSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

module.exports = mongoose.model('Produce', produceSchema);
