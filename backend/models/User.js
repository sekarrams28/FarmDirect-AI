const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['farmer', 'buyer', 'fpo', 'admin'],
      required: true,
    },
    preferredLanguage: {
      // Kept in sync with the frontend's i18n bundle (src/i18n/*.json):
      // en, ta, hi, te, kn, mr, bn. The old list (missing mr/bn) silently
      // rejected valid language selections from the UI.
      type: String,
      enum: ['en', 'ta', 'hi', 'te', 'kn', 'mr', 'bn'],
      default: 'en',
    },
    isActive: { type: Boolean, default: true },
    // Lets a user opt out of non-critical SMS notifications
    // (see SMS Notification Plan -> "Frontend Changes").
    smsOptOut: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
