const express = require('express');
const {
  createProduce,
  listMyProduce,
  getProduce,
  updateProduce,
  deleteProduce,
} = require('../controllers/produceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('farmer'), createProduce);
router.get('/', protect, listMyProduce);
router.get('/:id', getProduce);
router.put('/:id', protect, updateProduce);
router.delete('/:id', protect, deleteProduce);

module.exports = router;
