const { Quiz, Category, Question, Option, Attempt } = require('../models');
const { Op } = require('sequelize');

exports.getQuizzes = async (req, res) => {
  const { search, category, difficulty, sort } = req.query;
  const isAdmin = req.user && req.user.role === 'ADMIN';

  const where = {};
  if (!isAdmin) where.status = 'PUBLISHED';
  if (search) where.title = { [Op.iLike]: `%${search}%` };
  if (category) where.categoryId = category;
  if (difficulty) where.difficulty = difficulty;

  let order = [['createdAt', 'DESC']];
  if (sort === 'popularity') order = [['createdAt', 'DESC']];

  const quizzes = await Quiz.findAll({
    where,
    include: [{ model: Category, attributes: ['id', 'name'] }],
    order,
  });
  res.json(quizzes);
};

exports.getQuizById = async (req, res) => {
  const isAdmin = req.user && req.user.role === 'ADMIN';
  const quiz = await Quiz.findByPk(req.params.id, {
    include: [
      { model: Category, attributes: ['id', 'name'] },
      { model: Question, include: [{ model: Option, attributes: isAdmin ? ['id', 'optionText', 'isCorrect'] : ['id', 'optionText'] }] },
    ],
  });
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  if (!isAdmin && quiz.status !== 'PUBLISHED') return res.status(403).json({ message: 'Quiz not available' });
  res.json(quiz);
};

exports.createQuiz = async (req, res) => {
  try {
    const { title, description, categoryId, difficulty, duration, passingScore, maxAttempts, status, thumbnail } = req.body;
    if (!title || !duration) return res.status(400).json({ message: 'Title and duration are required' });

    const quiz = await Quiz.create({
      title, description, categoryId, difficulty, duration,
      passingScore, maxAttempts, status: status || 'DRAFT', thumbnail,
    });
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create quiz', error: err.message });
  }
};

exports.updateQuiz = async (req, res) => {
  const quiz = await Quiz.findByPk(req.params.id);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  const fields = ['title', 'description', 'categoryId', 'difficulty', 'duration', 'passingScore', 'maxAttempts', 'status', 'thumbnail'];
  fields.forEach(f => { if (req.body[f] !== undefined) quiz[f] = req.body[f]; });
  await quiz.save();
  res.json(quiz);
};

exports.deleteQuiz = async (req, res) => {
  const quiz = await Quiz.findByPk(req.params.id);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  await quiz.destroy();
  res.json({ message: 'Quiz deleted' });
};

exports.publishQuiz = async (req, res) => {
  const quiz = await Quiz.findByPk(req.params.id);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  const { status } = req.body;
  quiz.status = status;
  await quiz.save();
  res.json(quiz);
};