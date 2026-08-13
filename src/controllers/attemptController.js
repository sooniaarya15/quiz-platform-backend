const { Quiz, Question, Option, Attempt, Answer } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

// POST /api/quizzes/:quizId/start
exports.startQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.quizId, { include: [Question] });
    if (!quiz || quiz.status !== 'PUBLISHED') {
      return res.status(404).json({ message: 'Quiz not available' });
    }

    const priorAttempts = await Attempt.count({
      where: { quizId: quiz.id, userId: req.user.id, status: { [Op.ne]: 'IN_PROGRESS' } },
    });
    if (priorAttempts >= quiz.maxAttempts) {
      return res.status(403).json({ message: 'Maximum attempts reached for this quiz' });
    }

    const existing = await Attempt.findOne({
      where: { quizId: quiz.id, userId: req.user.id, status: 'IN_PROGRESS' },
    });
    if (existing && existing.expiresAt > new Date()) {
      return res.json({ attemptId: existing.id, startedAt: existing.startedAt, expiresAt: existing.expiresAt, totalQuestions: quiz.Questions.length });
    }

    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + quiz.duration * 60 * 1000);

    const attempt = await Attempt.create({
      quizId: quiz.id, userId: req.user.id, startedAt, expiresAt, status: 'IN_PROGRESS',
    });

    res.status(201).json({ attemptId: attempt.id, startedAt, expiresAt, totalQuestions: quiz.Questions.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to start quiz', error: err.message });
  }
};

// POST /api/quizzes/:quizId/submit
// body: { attemptId, answers: [{ questionId, selectedOptionId }] }
exports.submitQuiz = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { attemptId, answers } = req.body;
    const attempt = await Attempt.findOne({
      where: { id: attemptId, quizId: req.params.quizId, userId: req.user.id },
      transaction: t,
    });
    if (!attempt) { await t.rollback(); return res.status(404).json({ message: 'Attempt not found' }); }
    if (attempt.status !== 'IN_PROGRESS') { await t.rollback(); return res.status(400).json({ message: 'Attempt already submitted' }); }

    const quiz = await Quiz.findByPk(attempt.quizId, {
      include: [{ model: Question, include: [Option] }],
      transaction: t,
    });

    const now = new Date();
    const isLate = now > attempt.expiresAt;
    const effectiveEndTime = isLate ? attempt.expiresAt : now;
    const timeTaken = Math.max(0, Math.round((effectiveEndTime - attempt.startedAt) / 1000));

    const answerMap = new Map((answers || []).map(a => [a.questionId, a.selectedOptionId]));

    let correct = 0, incorrect = 0, unanswered = 0, obtainedMarks = 0, totalMarks = 0;
    const answerRows = [];

    for (const q of quiz.Questions) {
      totalMarks += q.marks;
      const selectedOptionId = answerMap.get(q.id) || null;

      if (!selectedOptionId) {
        unanswered += 1;
        answerRows.push({ attemptId: attempt.id, questionId: q.id, selectedOptionId: null, isCorrect: false });
        continue;
      }

      const correctOption = q.Options.find(o => o.isCorrect);
      const isCorrect = correctOption && correctOption.id === selectedOptionId;

      if (isCorrect) { correct += 1; obtainedMarks += q.marks; }
      else { incorrect += 1; }

      answerRows.push({ attemptId: attempt.id, questionId: q.id, selectedOptionId, isCorrect: !!isCorrect });
    }

    await Answer.bulkCreate(answerRows, { transaction: t });

    const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 10000) / 100 : 0;
    const status = percentage >= quiz.passingScore ? 'PASSED' : 'FAILED';

    attempt.score = obtainedMarks;
    attempt.percentage = percentage;
    attempt.correctAnswers = correct;
    attempt.incorrectAnswers = incorrect;
    attempt.unanswered = unanswered;
    attempt.timeTaken = timeTaken;
    attempt.status = status;
    attempt.completedAt = now;
    await attempt.save({ transaction: t });

    await t.commit();
    res.json({
      attemptId: attempt.id,
      totalQuestions: quiz.Questions.length,
      correct, incorrect, unanswered,
      score: obtainedMarks, totalMarks, percentage, status, timeTaken,
      autoSubmittedLate: isLate,
    });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Failed to submit quiz', error: err.message });
  }
};

// GET /api/attempts (own attempt history)
exports.getMyAttempts = async (req, res) => {
  const attempts = await Attempt.findAll({
    where: { userId: req.user.id, status: { [Op.ne]: 'IN_PROGRESS' } },
    include: [{ model: Quiz, attributes: ['id', 'title'] }],
    order: [['completedAt', 'DESC']],
  });
  res.json(attempts);
};

// GET /api/attempts/:id
exports.getAttemptById = async (req, res) => {
  const attempt = await Attempt.findOne({
    where: { id: req.params.id, userId: req.user.id },
    include: [
      { model: Quiz, attributes: ['id', 'title', 'passingScore'] },
      {
        model: Answer,
        include: [
          { model: Question, include: [Option] },
          { model: Option, as: 'selectedOption' },
        ],
      },
    ],
  });
  if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
  res.json(attempt);
};