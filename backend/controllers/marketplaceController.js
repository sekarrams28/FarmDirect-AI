const asyncHandler = require('express-async-handler');
const Produce = require('../models/Produce');

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// GET /api/marketplace
const browseMarketplace = asyncHandler(async (req, res) => {
  const { crop, district, minQty, maxPrice } = req.query;
  const query = { status: 'available' };
  if (crop) query.crop = new RegExp(`^${crop}$`, 'i');
  if (district) query['location.district'] = new RegExp(district, 'i');
  if (minQty) query.quantity = { $gte: Number(minQty) };
  if (maxPrice) query.askingPrice = { $lte: Number(maxPrice) };

  const listings = await Produce.find(query)
    .populate({ path: 'farmer', populate: { path: 'user', select: 'name phone' } })
    .sort('-createdAt')
    .limit(100);

  res.json({ success: true, count: listings.length, listings });
});

// GET /api/marketplace/search?q=tomato
const searchMarketplace = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    res.status(400);
    throw new Error('Query parameter q is required');
  }
  const listings = await Produce.find({
    status: 'available',
    $or: [{ crop: new RegExp(q, 'i') }, { variety: new RegExp(q, 'i') }, { 'location.district': new RegExp(q, 'i') }],
  }).limit(100);
  res.json({ success: true, count: listings.length, listings });
});

// GET /api/marketplace/nearby?lat=..&lng=..&radiusKm=25
const nearbyMarketplace = asyncHandler(async (req, res) => {
  const { lat, lng, radiusKm = 25 } = req.query;
  if (!lat || !lng) {
    res.status(400);
    throw new Error('lat and lng query parameters are required');
  }

  const all = await Produce.find({ status: 'available', 'location.latitude': { $exists: true } });
  const nearby = all
    .map((p) => ({
      produce: p,
      distanceKm: haversineKm(Number(lat), Number(lng), p.location.latitude, p.location.longitude),
    }))
    .filter((p) => p.distanceKm <= Number(radiusKm))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  res.json({ success: true, count: nearby.length, results: nearby });
});

module.exports = { browseMarketplace, searchMarketplace, nearbyMarketplace, haversineKm };
