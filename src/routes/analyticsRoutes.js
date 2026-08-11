const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.use(protect, adminOnly);
router.get('/attempts', ctrl.getAllAttempts);
router.get('/attempts/:id', ctrl.getAttemptDetail);
router.get('/analytics', ctrl.getAdminStats);

module.exports = router;