const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema(
  {
    market: { type: mongoose.Schema.Types.ObjectId, ref: 'Market', required: true },
    crop: { type: String, required: true },
    minPrice: Number,
    maxPrice: Number,
    modalPrice: Number,
    date: { type: Date, default: Date.now },
    source: { type: String, default: 'manual' }, // e.g. 'agmarknet', 'manual', 'simulated'
  },
  { timestamps: true }
);

marketPriceSchema.index({ crop: 1, date: -1 });

module.exports = mongoose.model('MarketPrice', marketPriceSchema);
