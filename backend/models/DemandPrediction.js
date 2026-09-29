const mongoose = require('mongoose');

const demandPredictionSchema = new mongoose.Schema(
  {
    crop: { type: String, required: true },
    location: { type: String, required: true },
    predictedDemandKg: Number,
    trend: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] },
    forecastDays: { type: Number, default: 7 },
    modelVersion: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('DemandPrediction', demandPredictionSchema);
