const express = require('express');
const {
  browseMarketplace,
  searchMarketplace,
  nearbyMarketplace,
} = require('../controllers/marketplaceController');

const router = express.Router();

router.get('/', browseMarketplace);
router.get('/search', searchMarketplace);
router.get('/nearby', nearbyMarketplace);

module.exports = router;
