const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/attemptController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getMyAttempts);
router.get('/:id', ctrl.getAttemptById);

module.exports = router;