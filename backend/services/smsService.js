// SMS service — the only place in the app that talks to an SMS provider.
// Kept separate from orderController so order management stays modular
// (per FarmDirect_SMS_Notification_Plan.txt).
//
// Design rules this file follows:
//  1. SMS failure must NEVER break the order operation that triggered it.
//     Every public function here catches its own errors and logs them —
//     nothing here throws back into a controller.
//  2. One event per order is sent at most once (duplicate-SMS protection),
//     checked against SmsLog before dispatch.
//  3. The message language is chosen from the recipient's own
//     preferredLanguage, falling back to English if that language's
//     template isn't written yet.

const axios = require('axios');
const smsConfig = require('../config/sms');
const SmsLog = require('../models/SmsLog');
const Order = require('../models/Order');
const { isValidPhone } = require('../utils/validators');

const EVENTS = {
  ORDER_RECEIVED: 'ORDER_RECEIVED',
  ORDER_CONFIRMED: 'ORDER_CONFIRMED',
  ORDER_IN_TRANSIT: 'ORDER_IN_TRANSIT',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  TEST: 'TEST',
};

// ---------------------------------------------------------------------
// Message templates
// ---------------------------------------------------------------------
// Phase 5 of the plan: "Test English and Tamil first. Add other supported
// languages later." English and Tamil are filled in below; hi/te/kn/mr/bn
// fall back to English until their templates are added here — adding a
// language is just adding a key to each event's object, nothing else
// needs to change.
//
// Placeholders: {orderId} {crop} {quantity} {unit}
const TEMPLATES = {
  [EVENTS.ORDER_RECEIVED]: {
    en: 'FarmDirect: New order received. Order ID: {orderId}. Crop: {crop}, Quantity: {quantity} {unit}. Please open FarmDirect to confirm.',
    ta: 'FarmDirect: புதிய ஆர்டர் கிடைத்துள்ளது. ஆர்டர் ID: {orderId}. பயிர்: {crop}, அளவு: {quantity} {unit}. உறுதிப்படுத்த FarmDirect-ஐ திறக்கவும்.',
  },
  [EVENTS.ORDER_CONFIRMED]: {
    en: 'FarmDirect: Your order {orderId} has been confirmed by the farmer.',
    ta: 'FarmDirect: உங்கள் ஆர்டர் {orderId} விவசாயியால் உறுதிப்படுத்தப்பட்டது.',
  },
  [EVENTS.ORDER_IN_TRANSIT]: {
    en: 'FarmDirect: Your order {orderId} is now in transit.',
    ta: 'FarmDirect: உங்கள் ஆர்டர் {orderId} இப்போது போக்குவரத்தில் உள்ளது.',
  },
  [EVENTS.ORDER_DELIVERED]: {
    en: 'FarmDirect: Your order {orderId} has been successfully delivered.',
    ta: 'FarmDirect: உங்கள் ஆர்டர் {orderId} வெற்றிகரமாக வழங்கப்பட்டது.',
  },
  [EVENTS.ORDER_CANCELLED]: {
    en: 'FarmDirect: Order {orderId} has been cancelled.',
    ta: 'FarmDirect: ஆர்டர் {orderId} ரத்து செய்யப்பட்டது.',
  },
  [EVENTS.TEST]: {
    en: 'FarmDirect: This is a test SMS. If you received this, SMS delivery is working.',
    ta: 'FarmDirect: இது ஒரு சோதனை SMS. இது கிடைத்திருந்தால், SMS அனுப்பும் அமைப்பு வேலை செய்கிறது.',
  },
};

function formatOrderId(order) {
  return `FD${String(order._id).slice(-6).toUpperCase()}`;
}

function buildMessage(event, language, ctx) {
  const templatesForEvent = TEMPLATES[event] || TEMPLATES[EVENTS.TEST];
  const template = templatesForEvent[language] || templatesForEvent.en;
  return template.replace(/{(\w+)}/g, (_match, key) => (ctx[key] !== undefined ? ctx[key] : `{${key}}`));
}

function maskPhone(phone) {
  if (!phone || phone.length < 4) return phone;
  return `${phone.slice(0, 2)}${'*'.repeat(phone.length - 4)}${phone.slice(-2)}`;
}

// ---------------------------------------------------------------------
// Provider adapter
// ---------------------------------------------------------------------
async function deliverViaProvider(phone, message) {
  if (!smsConfig.isConfigured) {
    // Dev/demo mode — no real SMS_PROVIDER credentials set yet.
    console.log(`[smsService] MOCK SMS to ${maskPhone(phone)}: ${message}`);
    return { providerMessageId: `mock-${Date.now()}` };
  }

  // Generic payload shape. MSG91, Exotel and Twilio each have their own
  // request format and auth scheme — adjust this call to match whichever
  // provider is finally chosen; this shape is a placeholder.
  const response = await axios.post(
    smsConfig.apiUrl,
    {
      sender_id: smsConfig.senderId,
      to: phone,
      message,
    },
    {
      headers: { Authorization: smsConfig.apiKey },
      timeout: 10000,
    }
  );

  return { providerMessageId: response.data?.messageId || response.data?.request_id || null };
}

// ---------------------------------------------------------------------
// Core dispatch: one recipient, one event, with dedupe + logging
// ---------------------------------------------------------------------
async function deliverToUser({ order, event, user }) {
  if (!user || !user.phone) return;

  const phone = user.phone.trim();
  const language = user.preferredLanguage || 'en';
  const orderId = order ? order._id : null;

  if (!isValidPhone(phone)) {
    await SmsLog.create({
      user: user._id,
      order: orderId,
      phone: phone || 'unknown',
      event,
      language,
      message: '(not sent — invalid phone number)',
      status: 'skipped',
      failureReason: 'Invalid phone number',
    }).catch(() => {});
    return;
  }

  if (user.smsOptOut) {
    await SmsLog.create({
      user: user._id,
      order: orderId,
      phone,
      event,
      language,
      message: '(not sent — user opted out of SMS notifications)',
      status: 'skipped',
      failureReason: 'User opted out',
    }).catch(() => {});
    return;
  }

  // Duplicate-SMS protection: if a retried request already got this exact
  // event sent for this order/user, don't send it again.
  if (orderId) {
    const alreadySent = await SmsLog.findOne({ order: orderId, event, user: user._id, status: 'sent' });
    if (alreadySent) return;
  }

  const ctx = order
    ? {
        orderId: formatOrderId(order),
        crop: order.produce?.crop || 'produce',
        quantity: order.quantity,
        unit: order.produce?.unit || 'kg',
      }
    : {};
  const message = buildMessage(event, language, ctx);

  const log = await SmsLog.create({
    user: user._id,
    order: orderId,
    phone,
    event,
    language,
    message,
    status: 'pending',
  });

  try {
    const { providerMessageId } = await deliverViaProvider(phone, message);
    log.status = 'sent';
    log.providerMessageId = providerMessageId;
    await log.save();
  } catch (err) {
    log.status = 'failed';
    log.failureReason = err.message || 'Unknown SMS provider error';
    await log.save().catch(() => {});
    console.error(`[smsService] Failed to send ${event} SMS for order ${orderId}:`, err.message);
  }
}

async function getOrderWithParties(orderId) {
  return Order.findById(orderId)
    .populate('produce')
    .populate({ path: 'farmer', populate: { path: 'user' } })
    .populate({ path: 'buyer', populate: { path: 'user' } });
}

// pickRecipients(order) -> array of User documents (or nulls, filtered out)
async function sendEventSms(orderId, event, pickRecipients) {
  try {
    const order = await getOrderWithParties(orderId);
    if (!order) return;

    const recipients = (await pickRecipients(order)).filter((user) => user && user._id);
    await Promise.all(recipients.map((user) => deliverToUser({ order, event, user })));
  } catch (err) {
    // This function is always called fire-and-forget from the order
    // controller — never let an SMS problem surface as an order error.
    console.error(`[smsService] sendEventSms(${event}) failed for order ${orderId}:`, err.message);
  }
}

// ---------------------------------------------------------------------
// Public event functions (one per SMS event in the plan)
// ---------------------------------------------------------------------
function sendOrderReceivedSMS(orderId) {
  return sendEventSms(orderId, EVENTS.ORDER_RECEIVED, (order) => [order.farmer?.user]);
}

function sendOrderConfirmedSMS(orderId) {
  return sendEventSms(orderId, EVENTS.ORDER_CONFIRMED, (order) => [order.buyer?.user]);
}

function sendOrderInTransitSMS(orderId) {
  return sendEventSms(orderId, EVENTS.ORDER_IN_TRANSIT, (order) => [order.buyer?.user]);
}

function sendOrderDeliveredSMS(orderId) {
  return sendEventSms(orderId, EVENTS.ORDER_DELIVERED, (order) => [order.buyer?.user]);
}

function sendOrderCancelledSMS(orderId) {
  return sendEventSms(orderId, EVENTS.ORDER_CANCELLED, (order) => [order.farmer?.user, order.buyer?.user]);
}

// Admin-triggered test SMS (Phase 2, item 8) — not tied to an order.
async function sendTestSms(phone, language = 'en', adminUserId = null) {
  const trimmedPhone = (phone || '').trim();
  if (!isValidPhone(trimmedPhone)) {
    throw new Error('Enter a valid 10-digit phone number');
  }

  const message = buildMessage(EVENTS.TEST, language, {});
  const log = await SmsLog.create({
    user: adminUserId,
    order: null,
    phone: trimmedPhone,
    event: EVENTS.TEST,
    language,
    message,
    status: 'pending',
  });

  try {
    const { providerMessageId } = await deliverViaProvider(trimmedPhone, message);
    log.status = 'sent';
    log.providerMessageId = providerMessageId;
    await log.save();
  } catch (err) {
    log.status = 'failed';
    log.failureReason = err.message || 'Unknown SMS provider error';
    await log.save().catch(() => {});
    throw err;
  }

  return log;
}

module.exports = {
  EVENTS,
  sendOrderReceivedSMS,
  sendOrderConfirmedSMS,
  sendOrderInTransitSMS,
  sendOrderDeliveredSMS,
  sendOrderCancelledSMS,
  sendTestSms,
  // exported for tests / reuse (e.g. showing a friendly order id on the frontend)
  formatOrderId,
};
