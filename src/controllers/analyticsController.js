const { User, Quiz, Question, Attempt, Category } = require('../models');
const { Op, fn, col } = require('sequelize');

exports.getAdminStats = async (req, res) => {
  const [totalStudents, totalQuizzes, published, draft, totalQuestions, totalAttempts, passed, failed] = await Promise.all([
    User.count({ where: { role: 'STUDENT' } }),
    Quiz.count(),
    Quiz.count({ where: { status: 'PUBLISHED' } }),
    Quiz.count({ where: { status: 'DRAFT' } }),
    Question.count(),
    Attempt.count({ where: { status: { [Op.ne]: 'IN_PROGRESS' } } }),
    Attempt.count({ where: { status: 'PASSED' } }),
    Attempt.count({ where: { status: 'FAILED' } }),
  ]);

  const avgResult = await Attempt.findOne({
    attributes: [[fn('AVG', col('percentage')), 'avgScore']],
    where: { status: { [Op.ne]: 'IN_PROGRESS' } },
    raw: true,
  });

  res.json({
    totalStudents, totalQuizzes, publishedQuizzes: published, draftQuizzes: draft,
    totalQuestions, totalAttempts,
    averageScore: avgResult && avgResult.avgScore ? Math.round(avgResult.avgScore * 100) / 100 : 0,
    passedAttempts: passed, failedAttempts: failed,
  });
};

exports.getAllAttempts = async (req, res) => {
  const attempts = await Attempt.findAll({
    where: { status: { [Op.ne]: 'IN_PROGRESS' } },
    include: [{ model: User, attributes: ['id', 'name', 'email'] }, { model: Quiz, attributes: ['id', 'title'] }],
    order: [['completedAt', 'DESC']],
  });
  res.json(attempts);
};

exports.getAttemptDetail = async (req, res) => {
  const { Answer, Option } = require('../models');
  const attempt = await Attempt.findByPk(req.params.id, {
    include: [
      { model: User, attributes: ['id', 'name', 'email'] },
      { model: Quiz, attributes: ['id', 'title', 'passingScore'] },
      { model: Answer, include: [{ model: Question, include: [Option] }, { model: Option, as: 'selectedOption' }] },
    ],
  });
  if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
  res.json(attempt);
};