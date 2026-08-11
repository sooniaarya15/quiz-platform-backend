const { User, Attempt, Quiz } = require('../models');
const { Op } = require('sequelize');

exports.getAllUsers = async (req, res) => {
  const { search } = req.query;
  const where = { role: 'STUDENT' };
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }
  const users = await User.findAll({ where, attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] } });
  res.json(users);
};

exports.getUserById = async (req, res) => {
  const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const attempts = await Attempt.findAll({
    where: { userId: user.id, status: { [Op.ne]: 'IN_PROGRESS' } },
    include: [{ model: Quiz, attributes: ['title'] }],
    order: [['completedAt', 'DESC']],
  });

  const totalAttempts = attempts.length;
  const avgScore = totalAttempts ? attempts.reduce((s, a) => s + a.percentage, 0) / totalAttempts : 0;
  const highestScore = totalAttempts ? Math.max(...attempts.map(a => a.percentage)) : 0;

  res.json({ user, attempts, stats: { totalAttempts, avgScore, highestScore } });
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.status = status;
  await user.save();
  res.json({ message: 'Status updated', user });
};

exports.deleteUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  await user.destroy();
  res.json({ message: 'User deleted' });
};