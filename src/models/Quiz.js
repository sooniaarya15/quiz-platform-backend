const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Quiz = sequelize.define('Quiz', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  difficulty: { type: DataTypes.ENUM('EASY', 'INTERMEDIATE', 'HARD'), defaultValue: 'EASY' },
  duration: { type: DataTypes.INTEGER, allowNull: false, comment: 'in minutes' },
  passingScore: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 60 },
  maxAttempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  status: { type: DataTypes.ENUM('DRAFT', 'PUBLISHED', 'UNPUBLISHED'), defaultValue: 'DRAFT' },
  thumbnail: { type: DataTypes.STRING, allowNull: true },
}, { tableName: 'quizzes', timestamps: true });

module.exports = Quiz;