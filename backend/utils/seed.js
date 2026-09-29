/**
 * Seed the database with a small, realistic demo dataset so the SIH demo
 * flow (section 19 of the project plan) can be run end-to-end.
 *
 * Usage: npm run seed
 */
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Farmer = require('../models/Farmer');
const Buyer = require('../models/Buyer');
const Produce = require('../models/Produce');

const TN_LOCATIONS = {
  Salem: { latitude: 11.664, longitude: 78.146 },
  Coimbatore: { latitude: 11.0168, longitude: 76.9558 },
  Madurai: { latitude: 9.9252, longitude: 78.1198 },
  Tiruchirappalli: { latitude: 10.7905, longitude: 78.7047 },
  Erode: { latitude: 11.341, longitude: 77.7172 },
};

async function seed() {
  await connectDB();
  console.log('Clearing existing demo collections...');
  await Promise.all([User.deleteMany({}), Farmer.deleteMany({}), Buyer.deleteMany({}), Produce.deleteMany({})]);

  console.log('Creating farmers...');
  const farmerDefs = [
    { name: 'Murugan K', phone: '9000000001', village: 'Kolathur', district: 'Salem' },
    { name: 'Lakshmi R', phone: '9000000002', village: 'Ammapettai', district: 'Salem' },
    { name: 'Selvam P', phone: '9000000003', village: 'Sankari', district: 'Salem' },
  ];
  const farmers = [];
  for (const f of farmerDefs) {
    const user = await User.create({ name: f.name, phone: f.phone, password: 'password123', role: 'farmer', preferredLanguage: 'ta' });
    const farmer = await Farmer.create({
      user: user._id,
      village: f.village,
      district: f.district,
      location: TN_LOCATIONS[f.district],
      primaryCrops: ['Tomato'],
    });
    farmers.push(farmer);
  }

  console.log('Creating buyers...');
  const buyerDefs = [
    { name: 'ABC Foods', phone: '9000000011', businessName: 'ABC Foods Pvt Ltd', buyerType: 'wholesaler', district: 'Salem' },
    { name: 'GreenMart Retail', phone: '9000000012', businessName: 'GreenMart Retail', buyerType: 'retailer', district: 'Coimbatore' },
    { name: 'SouthSpice Exports', phone: '9000000013', businessName: 'SouthSpice Exports', buyerType: 'exporter', district: 'Erode' },
  ];
  for (const b of buyerDefs) {
    const user = await User.create({ name: b.name, phone: b.phone, password: 'password123', role: 'buyer' });
    await Buyer.create({
      user: user._id,
      businessName: b.businessName,
      buyerType: b.buyerType,
      location: { district: b.district, ...TN_LOCATIONS[b.district] },
      preferredCrops: ['Tomato', 'Onion'],
    });
  }

  console.log('Creating an admin user...');
  await User.create({ name: 'Admin', phone: '9999999999', password: 'admin12345', role: 'admin' });

  console.log('Creating produce listings...');
  const listings = [
    { farmer: farmers[0], crop: 'Tomato', quantity: 500, askingPrice: 24 },
    { farmer: farmers[1], crop: 'Tomato', quantity: 300, askingPrice: 23 },
    { farmer: farmers[2], crop: 'Tomato', quantity: 700, askingPrice: 22 },
  ];
  for (const l of listings) {
    await Produce.create({
      farmer: l.farmer._id,
      crop: l.crop,
      quantity: l.quantity,
      unit: 'kg',
      askingPrice: l.askingPrice,
      location: { village: l.farmer.village, district: l.farmer.district, state: 'Tamil Nadu', ...TN_LOCATIONS[l.farmer.district] },
      availableFrom: new Date(),
      status: 'available',
    });
  }

  console.log('Done. Demo login: phone 9000000001 / password password123 (farmer), 9000000011 / password123 (buyer), 9999999999 / admin12345 (admin).');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
