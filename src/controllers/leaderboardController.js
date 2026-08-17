const { Attempt, User } = require('../models');
const { Op } = require('sequelize');

exports.getLeaderboard = async (req, res) => {
  const { scope } = req.query;
  const where = { status: { [Op.ne]: 'IN_PROGRESS' } };

  if (scope === 'monthly') {
    const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
    where.completedAt = { [Op.gte]: start };
  } else if (scope === 'weekly') {
    const start = new Date(); start.setDate(start.getDate() - 7);
    where.completedAt = { [Op.gte]: start };
  }

  const attempts = await Attempt.findAll({
    where,
    include: [{ model: User, attributes: ['id', 'name'] }],
  });

  const byUser = {};
  for (const a of attempts) {
    const uid = a.userId;
    if (!byUser[uid]) byUser[uid] = { studentId: uid, studentName: a.User.name, totalScore: 0, count: 0, highest: 0 };
    byUser[uid].totalScore += a.percentage;
    byUser[uid].count += 1;
    byUser[uid].highest = Math.max(byUser[uid].highest, a.percentage);
  }

  const leaderboard = Object.values(byUser)
    .map(u => ({
      studentId: u.studentId,
      studentName: u.studentName,
      averageScore: Math.round((u.totalScore / u.count) * 100) / 100,
      highestScore: u.highest,
      quizzesCompleted: u.count,
    }))
    .sort((a, b) => b.averageScore - a.averageScore)
    .map((u, idx) => ({ rank: idx + 1, ...u }));

  res.json(leaderboard);
};