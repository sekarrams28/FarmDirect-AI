const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    produce: { type: mongoose.Schema.Types.ObjectId, ref: 'Produce', required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true },
    offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
    quantity: { type: Number, required: true },
    agreedPrice: { type: Number, required: true },
    transportCostEstimate: Number,
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'collecting', 'in_transit', 'delivered', 'cancelled'],
      default: 'placed',
    },
    timeline: [
      {
        status: String,
        note: String,
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.pre('save', function stampTimeline(next) {
  if (this.isModified('status') || this.isNew) {
    this.timeline.push({ status: this.status, at: new Date() });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
