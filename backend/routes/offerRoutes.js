const express = require('express');
const { createOffer, listOffers, updateOffer } = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('buyer'), createOffer);
router.get('/', listOffers);
router.put('/:id', protect, updateOffer);

module.exports = router;
