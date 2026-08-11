require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Category, Quiz, Question, Option } = require('./models');

async function seed() {
  await sequelize.sync({ alter: true });

  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const [admin] = await User.findOrCreate({
    where: { email: 'admin@quizplatform.com' },
    defaults: { name: 'Admin', password: adminPassword, role: 'ADMIN' },
  });

  const [jsCategory] = await Category.findOrCreate({
    where: { name: 'JavaScript' },
    defaults: { description: 'JavaScript language topics' },
  });

  const [quiz] = await Quiz.findOrCreate({
    where: { title: 'JavaScript Fundamentals' },
    defaults: {
      description: 'Test your knowledge of JavaScript fundamentals.',
      categoryId: jsCategory.id,
      difficulty: 'INTERMEDIATE',
      duration: 20,
      passingScore: 60,
      maxAttempts: 2,
      status: 'PUBLISHED',
    },
  });

  const existingQuestions = await Question.count({ where: { quizId: quiz.id } });
  if (existingQuestions === 0) {
    const q1 = await Question.create({ quizId: quiz.id, questionText: 'Which method converts a JSON string into a JavaScript object?', marks: 1, explanation: 'JSON.parse() converts a JSON string into a JavaScript object.' });
    await Option.bulkCreate([
      { questionId: q1.id, optionText: 'JSON.stringify()', isCorrect: false },
      { questionId: q1.id, optionText: 'JSON.parse()', isCorrect: true },
      { questionId: q1.id, optionText: 'JSON.convert()', isCorrect: false },
      { questionId: q1.id, optionText: 'JSON.object()', isCorrect: false },
    ]);

    const q2 = await Question.create({ quizId: quiz.id, questionText: 'Which keyword is used to declare a constant?', marks: 1, explanation: 'const declares a block-scoped constant.' });
    await Option.bulkCreate([
      { questionId: q2.id, optionText: 'var', isCorrect: false },
      { questionId: q2.id, optionText: 'let', isCorrect: false },
      { questionId: q2.id, optionText: 'const', isCorrect: true },
      { questionId: q2.id, optionText: 'static', isCorrect: false },
    ]);
  }

  console.log('Seed complete. Admin login: admin@quizplatform.com / Admin@123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });