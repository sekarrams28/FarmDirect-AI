const asyncHandler = require('express-async-handler');
const { callAI } = require('../utils/aiClient');
const Produce = require('../models/Produce');
const Offer = require('../models/Offer');
const DemandPrediction = require('../models/DemandPrediction');
const PricePrediction = require('../models/PricePrediction');

// All of these follow the same shape: Node validates + enriches the request,
// forwards it to FastAPI, stores a copy of the result, and returns it.
// React never calls ai-service directly — only through these routes.

// POST /api/ai/demand   { crop, location, forecastDays? }
const predictDemand = asyncHandler(async (req, res) => {
  const { crop, location, forecastDays = 7 } = req.body;
  if (!crop || !location) {
    res.status(400);
    throw new Error('crop and location are required');
  }

  const result = await callAI('/predict/demand', { crop, location, forecast_days: forecastDays });
  if (!result.ok) {
    res.status(502);
    throw new Error('AI service unavailable: ' + JSON.stringify(result.error));
  }

  await DemandPrediction.create({
    crop,
    location,
    predictedDemandKg: result.data.predictedDemandKg,
    trend: result.data.trend,
    forecastDays,
    modelVersion: result.data.modelVersion,
  });

  res.json({ success: true, prediction: result.data });
});

// POST /api/ai/price   { produceId } OR { crop, location, currentPrice, ... }
const predictPrice = asyncHandler(async (req, res) => {
  let payload = req.body;

  if (req.body.produceId) {
    const produce = await Produce.findById(req.body.produceId);
    if (!produce) {
      res.status(404);
      throw new Error('Produce listing not found');
    }
    payload = {
      crop: produce.crop,
      location:
        produce.location?.district ||
        produce.location?.village ||
        'Unknown',
      current_price: produce.askingPrice,
      quantity: produce.quantity,
    };
  }

  const result = await callAI('/predict/price', payload);
  if (!result.ok) {
    res.status(502);
    throw new Error('AI service unavailable: ' + JSON.stringify(result.error));
  }

  if (req.body.produceId) {
    await Produce.findByIdAndUpdate(req.body.produceId, {
      lastPricePrediction: { ...result.data, computedAt: new Date() },
    });
  }
  await PricePrediction.create({
    crop: payload.crop,
    location: payload.location,
    recommendedMin: result.data.recommendedMin,
    recommendedMax: result.data.recommendedMax,
    bestBuyerPrice: result.data.bestBuyerPrice,
    recommendation: result.data.recommendation,
    modelVersion: result.data.modelVersion,
  });

  res.json({ success: true, prediction: result.data });
});

// POST /api/ai/buyer-match   { produceId }
const matchBuyers = asyncHandler(async (req, res) => {
  const { produceId } = req.body;
  const produce = await Produce.findById(produceId);
  if (!produce) {
    res.status(404);
    throw new Error('Produce listing not found');
  }

  const offers = await Offer.find({ produce: produceId, status: 'pending' }).populate('buyer');
  const payload = {
    crop: produce.crop,
    quantity: produce.quantity,
    location: produce.location,
    buyers: offers.map((o) => ({
      offerId: o._id,
      offeredPrice: o.offeredPrice,
      quantity: o.quantity,
      deliveryDeadline: o.deliveryDeadline,
      buyerLocation: o.buyer.location,
    })),
  };

  const result = await callAI('/recommend/buyer', payload);
  if (!result.ok) {
    res.status(502);
    throw new Error('AI service unavailable: ' + JSON.stringify(result.error));
  }

  // Persist scores back onto the offers so the marketplace UI can sort by them.
  await Promise.all(
    (result.data.rankedOffers || []).map((r) => Offer.findByIdAndUpdate(r.offerId, { matchScore: r.score }))
  );

  res.json({ success: true, match: result.data });
});

// POST /api/ai/logistics   { produceIds: [...] }
const optimizeLogistics = asyncHandler(async (req, res) => {
  const { produceIds } = req.body;
  if (!produceIds || !produceIds.length) {
    res.status(400);
    throw new Error('produceIds (array) is required');
  }

  const listings = await Produce.find({ _id: { $in: produceIds } });
  const payload = {
    stops: listings.map((p) => ({
      produceId: p._id,
      latitude: p.location.latitude,
      longitude: p.location.longitude,
      quantityKg: p.quantity,
    })),
  };

  const result = await callAI('/optimize/route', payload);
  if (!result.ok) {
    res.status(502);
    throw new Error('AI service unavailable: ' + JSON.stringify(result.error));
  }

  res.json({ success: true, route: result.data });
});

// POST /api/ai/farm-advisor   { crop, quantity, location }
const farmAdvisor = asyncHandler(async (req, res) => {
  const { crop, quantity, location } = req.body;
  if (!crop || !quantity || !location) {
    res.status(400);
    throw new Error('crop, quantity and location are required');
  }

  const result = await callAI('/advisor', { crop, quantity, location });
  if (!result.ok) {
    res.status(502);
    throw new Error('AI service unavailable: ' + JSON.stringify(result.error));
  }

  res.json({ success: true, advice: result.data });
});

module.exports = { predictDemand, predictPrice, matchBuyers, optimizeLogistics, farmAdvisor };
