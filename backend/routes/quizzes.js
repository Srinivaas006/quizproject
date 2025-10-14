const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).end();
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).end();
  }
};

// Create quiz
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).end();
  const { title, timePerQuestion, questions } = req.body;
  const sessionCode = Math.random().toString(36).substr(2, 6).toUpperCase();
  const quiz = new Quiz({ title, timePerQuestion, questions, sessionCode, createdBy: req.user.id });
  await quiz.save();
  res.json({ sessionCode });
});

// Fetch quiz meta
router.get('/:code', async (req, res) => {
  const quiz = await Quiz.findOne({ sessionCode: req.params.code });
  if (!quiz) return res.status(404).end();
  res.json({ title: quiz.title, questions: quiz.questions, timePerQuestion: quiz.timePerQuestion });
});

// Save result
router.post('/:code/result', async (req, res) => {
  const { name, correctCount, incorrectCount } = req.body;
  const result = new Result({ sessionCode: req.params.code, participantName: name, correctCount, incorrectCount });
  await result.save();
  res.json({ success: true });
});

module.exports = router;
