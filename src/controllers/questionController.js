const { Question, Option, Quiz } = require('../models');
const sequelize = require('../config/db');

exports.getQuestions = async (req, res) => {
  const questions = await Question.findAll({
    where: { quizId: req.params.quizId },
    include: [{ model: Option }],
  });
  res.json(questions);
};

// body: { questionText, marks, explanation, difficulty, options: [{optionText, isCorrect}] }
exports.createQuestion = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const quiz = await Quiz.findByPk(req.params.quizId);
    if (!quiz) { await t.rollback(); return res.status(404).json({ message: 'Quiz not found' }); }

    const { questionText, marks, explanation, difficulty, options } = req.body;
    if (!questionText || !options || options.length < 2) {
      await t.rollback();
      return res.status(400).json({ message: 'Question text and at least 2 options are required' });
    }
    if (!options.some(o => o.isCorrect)) {
      await t.rollback();
      return res.status(400).json({ message: 'At least one correct option is required' });
    }

    const question = await Question.create(
      { quizId: quiz.id, questionText, marks: marks || 1, explanation, difficulty },
      { transaction: t }
    );

    const optionRows = options.map(o => ({
      questionId: question.id, optionText: o.optionText, isCorrect: !!o.isCorrect,
    }));
    await Option.bulkCreate(optionRows, { transaction: t });

    await t.commit();
    const full = await Question.findByPk(question.id, { include: [{ model: Option }] });
    res.status(201).json(full);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Failed to create question', error: err.message });
  }
};

exports.updateQuestion = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) { await t.rollback(); return res.status(404).json({ message: 'Question not found' }); }

    const { questionText, marks, explanation, difficulty, options } = req.body;
    if (questionText !== undefined) question.questionText = questionText;
    if (marks !== undefined) question.marks = marks;
    if (explanation !== undefined) question.explanation = explanation;
    if (difficulty !== undefined) question.difficulty = difficulty;
    await question.save({ transaction: t });

    if (options && options.length) {
      await Option.destroy({ where: { questionId: question.id }, transaction: t });
      const optionRows = options.map(o => ({
        questionId: question.id, optionText: o.optionText, isCorrect: !!o.isCorrect,
      }));
      await Option.bulkCreate(optionRows, { transaction: t });
    }

    await t.commit();
    const full = await Question.findByPk(question.id, { include: [{ model: Option }] });
    res.json(full);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Failed to update question', error: err.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  const question = await Question.findByPk(req.params.id);
  if (!question) return res.status(404).json({ message: 'Question not found' });
  await question.destroy();
  res.json({ message: 'Question deleted' });
};