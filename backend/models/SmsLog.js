const mongoose = require('mongoose');

// Kept in sync with the event names used in services/smsService.js.
const EVENTS = [
  'ORDER_RECEIVED',
  'ORDER_CONFIRMED',
  'ORDER_IN_TRANSIT',
  'ORDER_DELIVERED',
  'ORDER_CANCELLED',
  'TEST',
];

const smsLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    phone: { type: String, required: true },
    event: { type: String, enum: EVENTS, required: true },
    language: { type: String, default: 'en' },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'skipped'],
      default: 'pending',
    },
    providerMessageId: String,
    // Populated when status === 'failed' (provider error) or 'skipped'
    // (e.g. user opted out, invalid phone).
    failureReason: String,
  },
  { timestamps: true }
);

smsLogSchema.index({ order: 1, event: 1, user: 1 });

// Mask the phone number wherever a log is serialized to JSON (API
// responses, admin screens) — the plan requires this everywhere logs are
// displayed. The raw value stays in the DB for delivery-report lookups.
smsLogSchema.set('toJSON', {
  transform: (_doc, ret) => {
    if (ret.phone && ret.phone.length >= 4) {
      const visibleStart = ret.phone.slice(0, 2);
      const visibleEnd = ret.phone.slice(-2);
      ret.phone = `${visibleStart}${'*'.repeat(ret.phone.length - 4)}${visibleEnd}`;
    }
    return ret;
  },
});

module.exports = mongoose.model('SmsLog', smsLogSchema);
