const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Answer = sequelize.define('Answer', {
  isCorrect: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'answers', timestamps: true });

module.exports = Answer;