const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Produce = require('../models/Produce');
const Buyer = require('../models/Buyer');
const Farmer = require('../models/Farmer');
const Notification = require('../models/Notification');
const SmsLog = require('../models/SmsLog');
const smsService = require('../services/smsService');
const { isPositiveNumber, ValidationErrors } = require('../utils/validators');

// Attaches each order's most recent SMS status (from the viewing user's
// own perspective) so the frontend can show a [SMS Sent]/[SMS Pending]/
// [SMS Failed] indicator without a separate request per order.
async function attachSmsStatus(orders, userId) {
  const orderIds = orders.map((o) => o._id);
  if (orderIds.length === 0) return orders.map((o) => ({ ...o.toObject(), smsStatus: null }));

  const logs = await SmsLog.find({ order: { $in: orderIds }, user: userId }).sort('-createdAt').lean();
  const latestByOrder = {};
  for (const log of logs) {
    const key = String(log.order);
    if (!latestByOrder[key]) latestByOrder[key] = log.status; // first hit per order = latest, thanks to sort
  }

  return orders.map((o) => {
    const plain = o.toObject ? o.toObject() : o;
    plain.smsStatus = latestByOrder[String(o._id)] || null;
    return plain;
  });
}

const VALID_STATUSES = ['placed', 'confirmed', 'collecting', 'in_transit', 'delivered', 'cancelled'];

// POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const buyer = await Buyer.findOne({ user: req.user._id });
  if (!buyer) {
    res.status(400);
    throw new Error('Only buyers can place orders. Complete your buyer profile first.');
  }

  const { produceId, quantity, agreedPrice, offerId, transportCostEstimate } = req.body;

  const errors = new ValidationErrors();
  if (!isPositiveNumber(quantity)) errors.add('quantity', 'Order quantity must be a positive number');
  if (agreedPrice !== undefined && !isPositiveNumber(agreedPrice)) {
    errors.add('agreedPrice', 'Agreed price must be a positive number');
  }
  if (errors.hasErrors) {
    res.status(400);
    throw new Error(errors.message);
  }

  const produce = await Produce.findById(produceId);
  if (!produce || produce.status !== 'available') {
    res.status(400);
    throw new Error('This listing is no longer available');
  }
  if (quantity > produce.quantity) {
    res.status(400);
    throw new Error('Order quantity exceeds available produce');
  }

  const order = await Order.create({
    produce: produce._id,
    farmer: produce.farmer,
    buyer: buyer._id,
    offer: offerId || undefined,
    quantity,
    agreedPrice: agreedPrice || produce.askingPrice,
    transportCostEstimate,
    status: 'placed',
  });

  produce.quantity -= quantity;
  if (produce.quantity <= 0) produce.status = 'reserved';
  await produce.save();

  // Notify the farmer who owns the listing about the new order (and that
  // it's sold out, if this order took the last of it).
  const owningFarmer = await Farmer.findById(produce.farmer);
  if (owningFarmer) {
    await Notification.create({
      user: owningFarmer.user,
      title: 'New order received',
      message: `A buyer placed an order for ${quantity} ${produce.unit} of ${produce.crop}`,
      type: 'order',
    }).catch(() => {});

    if (produce.status === 'reserved') {
      await Notification.create({
        user: owningFarmer.user,
        title: 'Produce sold out',
        message: `Your listing for ${produce.crop} is now fully reserved`,
        type: 'order',
      }).catch(() => {});
    }
  }

  // Best-effort, fire-and-forget: SMS failures must never affect the order
  // response (see SMS Notification Plan -> "Error Handling").
  smsService.sendOrderReceivedSMS(order._id);

  res.status(201).json({ success: true, order });
});

// GET /api/orders  (role-aware)
const listOrders = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role === 'buyer') {
    const buyer = await Buyer.findOne({ user: req.user._id });
    query = { buyer: buyer?._id };
  } else if (req.user.role === 'farmer') {
    const farmer = await Farmer.findOne({ user: req.user._id });
    query = { farmer: farmer?._id };
  }
  // admin sees all orders (empty query)

  const orders = await Order.find(query).populate('produce').sort('-createdAt');
  const ordersWithSms = await attachSmsStatus(orders, req.user._id);
  res.json({ success: true, count: ordersWithSms.length, orders: ordersWithSms });
});

// GET /api/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('produce buyer farmer route');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (req.user.role !== 'admin') {
    const [farmer, buyer] = await Promise.all([
      Farmer.findOne({ user: req.user._id }),
      Buyer.findOne({ user: req.user._id }),
    ]);
    const isOwner =
      (farmer && String(order.farmer?._id || order.farmer) === String(farmer._id)) ||
      (buyer && String(order.buyer?._id || order.buyer) === String(buyer._id));
    if (!isOwner) {
      res.status(403);
      throw new Error('You do not have access to this order');
    }
  }

  const [orderWithSms] = await attachSmsStatus([order], req.user._id);
  res.json({ success: true, order: orderWithSms });
});

// PUT /api/orders/:id/status
// SECURITY: previously ANY authenticated user (including an unrelated buyer
// or farmer) could change ANY order's status. Now:
//  - admin can set any status
//  - the farmer who owns the order can move it through the fulfilment
//    stages (confirmed -> collecting -> in_transit -> delivered)
//  - the buyer who owns the order can only cancel it, and only before it
//    has shipped
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    res.status(400);
    throw new Error(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (req.user.role !== 'admin') {
    const farmer = await Farmer.findOne({ user: req.user._id });
    const isOwningFarmer = farmer && String(order.farmer) === String(farmer._id);

    if (isOwningFarmer) {
      if (status === 'placed') {
        res.status(403);
        throw new Error('Cannot revert an order back to "placed"');
      }
    } else {
      const buyer = await Buyer.findOne({ user: req.user._id });
      const isOwningBuyer = buyer && String(order.buyer) === String(buyer._id);
      if (!isOwningBuyer) {
        res.status(403);
        throw new Error('You do not have permission to update this order');
      }
      if (status !== 'cancelled') {
        res.status(403);
        throw new Error('Buyers can only cancel an order, not change its fulfilment status');
      }
      if (!['placed', 'confirmed'].includes(order.status)) {
        res.status(400);
        throw new Error('This order has already shipped and can no longer be cancelled');
      }
    }
  }

  order.status = status;
  if (note) order.timeline.push({ status, note, at: new Date() });
  await order.save();

  // In-app notification: notify the OTHER party in the deal, not the
  // person who just made the change (they already know — they did it).
  // Cancellation is the one case both sides need to hear about.
  const [orderFarmer, orderBuyer] = await Promise.all([
    Farmer.findById(order.farmer).select('user'),
    Buyer.findById(order.buyer).select('user'),
  ]);

  const notifyUserIds = new Set();
  if (status === 'cancelled') {
    if (orderFarmer) notifyUserIds.add(String(orderFarmer.user));
    if (orderBuyer) notifyUserIds.add(String(orderBuyer.user));
  } else if (orderBuyer) {
    // confirmed / collecting / in_transit / delivered are fulfilment
    // progress the buyer cares about.
    notifyUserIds.add(String(orderBuyer.user));
  }
  notifyUserIds.delete(String(req.user._id));

  await Promise.all(
    Array.from(notifyUserIds).map((userId) =>
      Notification.create({
        user: userId,
        title: 'Order status updated',
        message: `Order ${order._id} is now "${status}"`,
        type: 'order',
      }).catch(() => {})
    )
  );

  // SMS, per event (best-effort — never blocks or fails this response).
  const SMS_SENDER_BY_STATUS = {
    confirmed: smsService.sendOrderConfirmedSMS,
    in_transit: smsService.sendOrderInTransitSMS,
    delivered: smsService.sendOrderDeliveredSMS,
    cancelled: smsService.sendOrderCancelledSMS,
  };
  if (SMS_SENDER_BY_STATUS[status]) {
    SMS_SENDER_BY_STATUS[status](order._id);
  }

  const [orderWithSms] = await attachSmsStatus([order], req.user._id);
  res.json({ success: true, order: orderWithSms });
});

module.exports = { createOrder, listOrders, getOrder, updateOrderStatus };
