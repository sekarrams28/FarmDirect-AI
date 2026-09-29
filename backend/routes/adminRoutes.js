const express = require('express');
const { getDashboard, getAnalytics, sendTestSms, listSmsLogs } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', protect, authorize('admin'), getDashboard);
router.get('/analytics', protect, authorize('admin'), getAnalytics);
router.post('/sms/test', protect, authorize('admin'), sendTestSms);
router.get('/sms/logs', protect, authorize('admin'), listSmsLogs);

module.exports = router;
