const express = require('express');
const router = express.Router({ mergeParams: true });
const ctrl = require('../controllers/questionController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/', ctrl.getQuestions);
router.post('/', protect, adminOnly, ctrl.createQuestion);

module.exports = router;