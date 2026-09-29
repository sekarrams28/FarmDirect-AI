const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
    stops: [
      {
        produce: { type: mongoose.Schema.Types.ObjectId, ref: 'Produce' },
        sequence: Number,
        latitude: Number,
        longitude: Number,
        quantityKg: Number,
      },
    ],
    totalDistanceKm: Number,
    estimatedDurationMin: Number,
    status: { type: String, enum: ['planned', 'active', 'completed'], default: 'planned' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Route', routeSchema);
