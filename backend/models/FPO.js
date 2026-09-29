const mongoose = require('mongoose');

const fpoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    registrationNumber: String,
    district: String,
    state: { type: String, default: 'Tamil Nadu' },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    memberFarmers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('FPO', fpoSchema);
