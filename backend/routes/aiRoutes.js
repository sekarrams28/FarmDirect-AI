const express = require('express');
const {
  predictDemand,
  predictPrice,
  matchBuyers,
  optimizeLogistics,
  farmAdvisor,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/demand', protect, predictDemand);
router.post('/price', protect, predictPrice);
router.post('/buyer-match', protect, matchBuyers);
router.post('/logistics', protect, optimizeLogistics);
router.post('/farm-advisor', protect, farmAdvisor);

module.exports = router;
