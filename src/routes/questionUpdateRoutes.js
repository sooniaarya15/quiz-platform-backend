// Top-level routes for PUT/DELETE /api/questions/:id
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/questionController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.use(protect, adminOnly);
router.put('/:id', ctrl.updateQuestion);
router.delete('/:id', ctrl.deleteQuestion);

module.exports = router;