const asyncHandler = require('express-async-handler');
const Produce = require('../models/Produce');
const Farmer = require('../models/Farmer');
const { isNonEmptyString, isPositiveNumber, ValidationErrors } = require('../utils/validators');

const VALID_UNITS = ['kg', 'quintal', 'tonne'];

function validateProduceInput(body, { partial = false } = {}) {
  const { crop, quantity, askingPrice, unit } = body;
  const errors = new ValidationErrors();

  if (!partial || crop !== undefined) {
    if (!isNonEmptyString(crop)) errors.add('crop', 'Crop name is required');
  }
  if (!partial || quantity !== undefined) {
    if (!isPositiveNumber(quantity)) errors.add('quantity', 'Quantity must be a positive number');
  }
  if (!partial || askingPrice !== undefined) {
    if (!isPositiveNumber(askingPrice)) errors.add('askingPrice', 'Asking price must be a positive number');
  }
  if (unit !== undefined && !VALID_UNITS.includes(unit)) {
    errors.add('unit', `unit must be one of: ${VALID_UNITS.join(', ')}`);
  }
  return errors;
}

// POST /api/produce
const createProduce = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ user: req.user._id });
  if (!farmer) {
    res.status(400);
    throw new Error('Only farmers can list produce. Complete your farmer profile first.');
  }

  const { crop, variety, quantity, unit, askingPrice, location, harvestDate, availableFrom, images } = req.body;

  const errors = validateProduceInput(req.body);
  if (errors.hasErrors) {
    res.status(400);
    throw new Error(errors.message);
  }

  const produce = await Produce.create({
    farmer: farmer._id,
    fpo: farmer.fpo || null,
    crop: crop.trim(),
    variety,
    quantity,
    unit,
    askingPrice,
    location: location || {
      village: farmer.village,
      district: farmer.district,
      state: farmer.state,
      latitude: farmer.location?.latitude,
      longitude: farmer.location?.longitude,
    },
    harvestDate,
    availableFrom,
    images,
  });

  res.status(201).json({ success: true, produce });
});

// GET /api/produce  (mine, if farmer; all, if admin)
const listMyProduce = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ user: req.user._id });
  const query = req.user.role === 'admin' ? {} : { farmer: farmer?._id };
  const produce = await Produce.find(query).sort('-createdAt');
  res.json({ success: true, count: produce.length, produce });
});

// GET /api/produce/:id
const getProduce = asyncHandler(async (req, res) => {
  const produce = await Produce.findById(req.params.id).populate({
    path: 'farmer',
    populate: { path: 'user', select: 'name phone' },
  });
  if (!produce) {
    res.status(404);
    throw new Error('Produce listing not found');
  }
  res.json({ success: true, produce });
});

// PUT /api/produce/:id
const updateProduce = asyncHandler(async (req, res) => {
  const produce = await Produce.findById(req.params.id);
  if (!produce) {
    res.status(404);
    throw new Error('Produce listing not found');
  }

  const farmer = await Farmer.findOne({ user: req.user._id });
  if (req.user.role !== 'admin' && (!farmer || String(produce.farmer) !== String(farmer._id))) {
    res.status(403);
    throw new Error('You can only edit your own listings');
  }

  const errors = validateProduceInput(req.body, { partial: true });
  if (errors.hasErrors) {
    res.status(400);
    throw new Error(errors.message);
  }

  // Only allow known, editable fields through — never let the client
  // overwrite farmer/fpo ownership or internal AI cache fields via a
  // blanket Object.assign.
  const editable = ['crop', 'variety', 'quantity', 'unit', 'askingPrice', 'location', 'harvestDate', 'availableFrom', 'images', 'status'];
  for (const field of editable) {
    if (req.body[field] !== undefined) produce[field] = req.body[field];
  }

  await produce.save();
  res.json({ success: true, produce });
});

// DELETE /api/produce/:id
const deleteProduce = asyncHandler(async (req, res) => {
  const produce = await Produce.findById(req.params.id);
  if (!produce) {
    res.status(404);
    throw new Error('Produce listing not found');
  }

  const farmer = await Farmer.findOne({ user: req.user._id });
  if (req.user.role !== 'admin' && (!farmer || String(produce.farmer) !== String(farmer._id))) {
    res.status(403);
    throw new Error('You can only delete your own listings');
  }

  await produce.deleteOne();
  res.json({ success: true, message: 'Listing removed' });
});

module.exports = { createProduce, listMyProduce, getProduce, updateProduce, deleteProduce };
