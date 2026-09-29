const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Farmer = require('../models/Farmer');
const Buyer = require('../models/Buyer');
const generateToken = require('../utils/generateToken');
const {
  PUBLIC_ROLES,
  isNonEmptyString,
  isValidPhone,
  isStrongPassword,
  isValidRole,
  isValidLanguage,
  ValidationErrors,
} = require('../utils/validators');

// POST /api/auth/register
// SECURITY: this is a PUBLIC route. The role coming from the request body
// must never be trusted beyond farmer/buyer/fpo — an "admin" role here used
// to let anyone create an administrator account. Admins are created only via
// createAdmin (below), which itself requires an existing admin's token, or
// via the one-time seed script (utils/seed.js).
const register = asyncHandler(async (req, res) => {
  const { name, phone, password, role, preferredLanguage, profile } = req.body;

  const errors = new ValidationErrors();
  if (!isNonEmptyString(name)) errors.add('name', 'Name is required');
  if (!isValidPhone(phone)) errors.add('phone', 'Enter a valid 10-digit phone number');
  if (!isStrongPassword(password)) {
    errors.add('password', 'Password must be at least 8 characters and include a letter and a number');
  }
  if (!isValidRole(role, PUBLIC_ROLES)) {
    errors.add('role', `role must be one of: ${PUBLIC_ROLES.join(', ')}`);
  }
  if (!isValidLanguage(preferredLanguage)) {
    errors.add('preferredLanguage', 'Unsupported language');
  }
  if (errors.hasErrors) {
    res.status(400);
    throw new Error(errors.message);
  }

  const existing = await User.findOne({ phone: phone.trim() });
  if (existing) {
    res.status(400);
    throw new Error('An account with this phone number already exists');
  }

  const user = await User.create({
    name: name.trim(),
    phone: phone.trim(),
    password,
    role, // guaranteed to be farmer/buyer/fpo by the check above
    preferredLanguage,
  });

  // Create the role-specific profile document alongside the user.
  if (role === 'farmer') {
    await Farmer.create({
      user: user._id,
      village: profile?.village,
      district: profile?.district,
      location: profile?.location,
      primaryCrops: profile?.primaryCrops || [],
    });
  } else if (role === 'buyer') {
    await Buyer.create({
      user: user._id,
      businessName: profile?.businessName,
      buyerType: profile?.buyerType,
      location: profile?.location,
      preferredCrops: profile?.preferredCrops || [],
    });
  }
  // 'fpo' profile documents are created by an admin/FPO onboarding flow,
  // not at self-registration time.

  res.status(201).json({
    success: true,
    user: user.toSafeObject(),
    token: generateToken(user._id, user.role),
  });
});

// POST /api/auth/admin/create
// Protected: only an existing admin (protect + authorize('admin') in the
// route) can call this. This is the ONLY supported way to create an admin
// account outside of the seed script.
const createAdmin = asyncHandler(async (req, res) => {
  const { name, phone, password, preferredLanguage } = req.body;

  const errors = new ValidationErrors();
  if (!isNonEmptyString(name)) errors.add('name', 'Name is required');
  if (!isValidPhone(phone)) errors.add('phone', 'Enter a valid 10-digit phone number');
  if (!isStrongPassword(password)) {
    errors.add('password', 'Password must be at least 8 characters and include a letter and a number');
  }
  if (!isValidLanguage(preferredLanguage)) {
    errors.add('preferredLanguage', 'Unsupported language');
  }
  if (errors.hasErrors) {
    res.status(400);
    throw new Error(errors.message);
  }

  const existing = await User.findOne({ phone: phone.trim() });
  if (existing) {
    res.status(400);
    throw new Error('An account with this phone number already exists');
  }

  const admin = await User.create({
    name: name.trim(),
    phone: phone.trim(),
    password,
    role: 'admin',
    preferredLanguage,
  });

  res.status(201).json({ success: true, user: admin.toSafeObject() });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  if (!isNonEmptyString(phone) || !isNonEmptyString(password)) {
    res.status(400);
    throw new Error('Phone number and password are required');
  }

  const user = await User.findOne({ phone: phone.trim() });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid phone number or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated. Contact an administrator.');
  }

  res.json({
    success: true,
    user: user.toSafeObject(),
    token: generateToken(user._id, user.role),
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/auth/notification-preferences
// Lets a user opt in/out of non-critical SMS notifications.
const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const { smsOptOut } = req.body;
  if (typeof smsOptOut !== 'boolean') {
    res.status(400);
    throw new Error('smsOptOut must be true or false');
  }

  req.user.smsOptOut = smsOptOut;
  await req.user.save();

  res.json({ success: true, user: req.user.toSafeObject() });
});

module.exports = { register, login, getMe, createAdmin, updateNotificationPreferences };
