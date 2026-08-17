const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Attempt = sequelize.define('Attempt', {
  score: { type: DataTypes.INTEGER, defaultValue: 0 },
  percentage: { type: DataTypes.FLOAT, defaultValue: 0 },
  correctAnswers: { type: DataTypes.INTEGER, defaultValue: 0 },
  incorrectAnswers: { type: DataTypes.INTEGER, defaultValue: 0 },
  unanswered: { type: DataTypes.INTEGER, defaultValue: 0 },
  timeTaken: { type: DataTypes.INTEGER, defaultValue: 0, comment: 'seconds' },
  status: { type: DataTypes.ENUM('IN_PROGRESS', 'PASSED', 'FAILED'), defaultValue: 'IN_PROGRESS' },
  startedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  completedAt: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'attempts', timestamps: true });

module.exports = Attempt;