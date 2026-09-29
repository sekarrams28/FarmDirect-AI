const rateLimit = require('express-rate-limit');

// Repeated failed logins are the most common brute-force vector, so login
// gets a tighter window than general auth traffic.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in a few minutes.',
  },
});

// Slightly looser limit for registration to allow for typo retries while
// still blocking scripted account-creation abuse.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many registration attempts from this network. Please try again later.',
  },
});

module.exports = { loginLimiter, registerLimiter };
