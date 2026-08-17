const sequelize = require('../config/db');
const User = require('./User');
const Category = require('./Category');
const Quiz = require('./Quiz');
const Question = require('./Question');
const Option = require('./Option');
const Attempt = require('./Attempt');
const Answer = require('./Answer');

Category.hasMany(Quiz, { foreignKey: 'categoryId', onDelete: 'SET NULL' });
Quiz.belongsTo(Category, { foreignKey: 'categoryId' });

Quiz.hasMany(Question, { foreignKey: 'quizId', onDelete: 'CASCADE' });
Question.belongsTo(Quiz, { foreignKey: 'quizId' });

Question.hasMany(Option, { foreignKey: 'questionId', onDelete: 'CASCADE' });
Option.belongsTo(Question, { foreignKey: 'questionId' });

User.hasMany(Attempt, { foreignKey: 'userId', onDelete: 'CASCADE' });
Attempt.belongsTo(User, { foreignKey: 'userId' });
Quiz.hasMany(Attempt, { foreignKey: 'quizId', onDelete: 'CASCADE' });
Attempt.belongsTo(Quiz, { foreignKey: 'quizId' });

Attempt.hasMany(Answer, { foreignKey: 'attemptId', onDelete: 'CASCADE' });
Answer.belongsTo(Attempt, { foreignKey: 'attemptId' });
Question.hasMany(Answer, { foreignKey: 'questionId' });
Answer.belongsTo(Question, { foreignKey: 'questionId' });
Option.hasMany(Answer, { foreignKey: 'selectedOptionId' });
Answer.belongsTo(Option, { foreignKey: 'selectedOptionId', as: 'selectedOption' });

module.exports = {
  sequelize,
  User,
  Category,
  Quiz,
  Question,
  Option,
  Attempt,
  Answer,
};