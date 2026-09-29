const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    fpo: { type: mongoose.Schema.Types.ObjectId, ref: 'FPO', default: null },
    // sparse: true so multiple vehicles can still omit a registration number
    // during data entry, while any number that IS provided must be unique.
    registrationNumber: { type: String, trim: true, unique: true, sparse: true },
    capacityKg: { type: Number, required: true },
    driverName: String,
    driverPhone: String,
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
