const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    produce: { type: mongoose.Schema.Types.ObjectId, ref: 'Produce', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true },
    offeredPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    deliveryDeadline: Date,
    matchScore: Number, // filled in by the AI buyer-matching engine
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

offerSchema.index({ produce: 1, status: 1 });

module.exports = mongoose.model('Offer', offerSchema);
