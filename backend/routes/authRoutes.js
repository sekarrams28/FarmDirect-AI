const express = require('express');
const { register, login, getMe, createAdmin, updateNotificationPreferences } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.get('/me', protect, getMe);
router.put('/notification-preferences', protect, updateNotificationPreferences);

// Admin accounts can ONLY be created by an existing admin. There is no
// public path to the 'admin' role.
router.post('/admin/create', protect, authorize('admin'), createAdmin);

module.exports = router;
