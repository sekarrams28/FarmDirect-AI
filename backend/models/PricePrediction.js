const mongoose = require('mongoose');

const pricePredictionSchema = new mongoose.Schema(
  {
    crop: { type: String, required: true },
    location: { type: String, required: true },
    recommendedMin: Number,
    recommendedMax: Number,
    bestBuyerPrice: Number,
    recommendation: { type: String, enum: ['SELL_NOW', 'WAIT', 'HOLD'] },
    modelVersion: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('PricePrediction', pricePredictionSchema);
