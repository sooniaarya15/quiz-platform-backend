const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/quizController');
const attemptCtrl = require('../controllers/attemptController');
const questionRoutes = require('./questionRoutes');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return next();
  try {
    const jwt = require('jsonwebtoken');
    const { User } = require('../models');
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id);
  } catch (e) { /* ignore invalid token for public routes */ }
  next();
};

router.get('/', optionalAuth, ctrl.getQuizzes);
router.get('/:id', optionalAuth, ctrl.getQuizById);
router.post('/', protect, adminOnly, ctrl.createQuiz);
router.put('/:id', protect, adminOnly, ctrl.updateQuiz);
router.delete('/:id', protect, adminOnly, ctrl.deleteQuiz);
router.patch('/:id/publish', protect, adminOnly, ctrl.publishQuiz);

router.use('/:quizId/questions', questionRoutes);

router.post('/:quizId/start', protect, attemptCtrl.startQuiz);
router.post('/:quizId/submit', protect, attemptCtrl.submitQuiz);

module.exports = router;