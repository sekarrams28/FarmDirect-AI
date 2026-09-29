const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Produce = require('../models/Produce');
const Order = require('../models/Order');
const MarketPrice = require('../models/MarketPrice');
const SmsLog = require('../models/SmsLog');
const smsService = require('../services/smsService');
const { isValidPhone } = require('../utils/validators');

// GET /api/admin/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const [farmers, buyers, fpos, activeListings, orders] = await Promise.all([
    User.countDocuments({ role: 'farmer' }),
    User.countDocuments({ role: 'buyer' }),
    User.countDocuments({ role: 'fpo' }),
    Produce.countDocuments({ status: 'available' }),
    Order.countDocuments(),
  ]);

  res.json({
    success: true,
    totals: { farmers, buyers, fpos, activeListings, orders },
  });
});

// GET /api/admin/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const supplyByCrop = await Produce.aggregate([
    { $match: { status: 'available' } },
    { $group: { _id: '$crop', totalQuantity: { $sum: '$quantity' }, listings: { $sum: 1 } } },
    { $sort: { totalQuantity: -1 } },
  ]);

  const ordersByStatus = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

  const recentPrices = await MarketPrice.find().sort('-date').limit(30);

  res.json({ success: true, supplyByCrop, ordersByStatus, recentPrices });
});

// POST /api/admin/sms/test
// Phase 2 (SMS service) item 8: "Implement a test SMS function" — lets an
// admin confirm the SMS provider is wired up correctly without needing a
// real order.
const sendTestSms = asyncHandler(async (req, res) => {
  const { phone, language } = req.body;
  if (!isValidPhone(phone)) {
    res.status(400);
    throw new Error('Enter a valid 10-digit phone number');
  }

  const log = await smsService.sendTestSms(phone, language || 'en', req.user._id);
  res.json({ success: true, log });
});

// GET /api/admin/sms/logs
// Recent SMS activity across the whole app, for a viva demo / debugging.
const listSmsLogs = asyncHandler(async (req, res) => {
  const logs = await SmsLog.find().sort('-createdAt').limit(100);
  res.json({ success: true, count: logs.length, logs });
});

module.exports = { getDashboard, getAnalytics, sendTestSms, listSmsLogs };
