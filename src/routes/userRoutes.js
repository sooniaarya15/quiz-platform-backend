const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.use(protect, adminOnly);
router.get('/', ctrl.getAllUsers);
router.get('/:id', ctrl.getUserById);
router.patch('/:id/status', ctrl.updateStatus);
router.delete('/:id', ctrl.deleteUser);

module.exports = router;