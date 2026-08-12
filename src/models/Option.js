const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Option = sequelize.define('Option', {
  optionText: { type: DataTypes.STRING, allowNull: false },
  isCorrect: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { tableName: 'options', timestamps: true });

module.exports = Option;