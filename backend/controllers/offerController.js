const asyncHandler = require('express-async-handler');
const Offer = require('../models/Offer');
const Produce = require('../models/Produce');
const Buyer = require('../models/Buyer');
const Farmer = require('../models/Farmer');
const Notification = require('../models/Notification');
const { isPositiveNumber, ValidationErrors } = require('../utils/validators');

const VALID_STATUSES = ['pending', 'accepted', 'rejected', 'expired'];

// POST /api/offers
const createOffer = asyncHandler(async (req, res) => {
  const buyer = await Buyer.findOne({ user: req.user._id });
  if (!buyer) {
    res.status(400);
    throw new Error('Only buyers can make offers');
  }

  const { produceId, offeredPrice, quantity, deliveryDeadline } = req.body;

  const errors = new ValidationErrors();
  if (!isPositiveNumber(offeredPrice)) errors.add('offeredPrice', 'Offered price must be a positive number');
  if (!isPositiveNumber(quantity)) errors.add('quantity', 'Quantity must be a positive number');
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
    throw new Error('Offer quantity exceeds available produce');
  }

  // Duplicate protection: a buyer shouldn't be able to stack multiple
  // pending offers on the same listing (accidental double-submits, or a
  // retried request while offline/flaky-network).
  const existingPending = await Offer.findOne({ produce: produce._id, buyer: buyer._id, status: 'pending' });
  if (existingPending) {
    res.status(400);
    throw new Error('You already have a pending offer on this listing. Update or wait for a response before making another.');
  }

  const offer = await Offer.create({
    produce: produce._id,
    buyer: buyer._id,
    offeredPrice,
    quantity,
    deliveryDeadline,
  });

  const owningFarmer = await Farmer.findById(produce.farmer);
  if (owningFarmer) {
    await Notification.create({
      user: owningFarmer.user,
      title: 'New offer received',
      message: `A buyer offered ₹${offeredPrice} for ${quantity} of your ${produce.crop} listing`,
      type: 'offer',
    }).catch(() => {});
  }

  res.status(201).json({ success: true, offer });
});

// GET /api/offers?produceId=...
const listOffers = asyncHandler(async (req, res) => {
  const { produceId } = req.query;
  const query = produceId ? { produce: produceId } : {};
  const offers = await Offer.find(query).populate('buyer produce').sort('-matchScore -createdAt');
  res.json({ success: true, count: offers.length, offers });
});

// PUT /api/offers/:id
// SECURITY: previously any authenticated user could accept/reject/expire
// ANY offer, since there was no check that the caller actually owns the
// listing (or the offer). Only the farmer who owns the produce listing —
// or an admin — may change an offer's status.
const updateOffer = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    res.status(400);
    throw new Error(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const offer = await Offer.findById(req.params.id).populate('produce');
  if (!offer) {
    res.status(404);
    throw new Error('Offer not found');
  }

  if (req.user.role !== 'admin') {
    const farmer = await Farmer.findOne({ user: req.user._id });
    const ownsListing = farmer && offer.produce && String(offer.produce.farmer) === String(farmer._id);
    if (!ownsListing) {
      res.status(403);
      throw new Error('Only the farmer who owns this listing can respond to this offer');
    }
  }

  offer.status = status || offer.status;
  await offer.save();

  // Notification.user references the User document, not the Farmer profile,
  // so resolve the listing owner's user id before writing the notification.
  const listingOwner = await Farmer.findById(offer.produce.farmer);
  if (listingOwner) {
    await Notification.create({
      user: listingOwner.user,
      title: 'Offer updated',
      message: `Offer on your listing is now "${offer.status}"`,
      type: 'offer',
    }).catch(() => {}); // notification failures shouldn't block the offer update
  }

  res.json({ success: true, offer });
});

module.exports = { createOffer, listOffers, updateOffer };
