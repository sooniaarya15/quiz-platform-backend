const { Category, Quiz } = require('../models');

exports.getCategories = async (req, res) => {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  res.json(categories);
};

exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  const category = await Category.create({ name, description });
  res.status(201).json(category);
};

exports.updateCategory = async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ message: 'Category not found' });
  const { name, description } = req.body;
  if (name) category.name = name;
  if (description !== undefined) category.description = description;
  await category.save();
  res.json(category);
};

exports.deleteCategory = async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ message: 'Category not found' });
  await category.destroy();
  res.json({ message: 'Category deleted' });
};

exports.getCategoryQuizzes = async (req, res) => {
  const quizzes = await Quiz.findAll({ where: { categoryId: req.params.id } });
  res.json(quizzes);
};