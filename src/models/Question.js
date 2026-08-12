const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Question = sequelize.define('Question', {
  questionText: { type: DataTypes.TEXT, allowNull: false },
  marks: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  explanation: { type: DataTypes.TEXT, allowNull: true },
  difficulty: { type: DataTypes.ENUM('EASY', 'INTERMEDIATE', 'HARD'), defaultValue: 'EASY' },
}, { tableName: 'questions', timestamps: true });

module.exports = Question;