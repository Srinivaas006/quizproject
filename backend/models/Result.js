const mongoose = require('mongoose');

const AnswerDetailSchema = new mongoose.Schema({
  questionNumber: Number,
  question: String,
  yourAnswer: String,
  correctAnswer: String,
  result: { type: String, enum: ['Correct', 'Incorrect', 'Not Attempted'] },
  totalScore: Number
}, { _id: false });

const ResultSchema = new mongoose.Schema({
  sessionCode: { type: String, required: true, index: true },
  participantName: { type: String, required: true },
  rollNo: { type: String, default: '' },
  dept: { type: String, default: '' },
  year: { type: String, default: '' },
  totalScore: { type: Number, default: 0 },
  maxPossibleScore: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  incorrectCount: { type: Number, default: 0 },
  notAttemptedCount: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  accuracyPercentage: { type: Number, default: 0 },
  grade: { type: String, default: 'F' },
  detailedAnswers: [AnswerDetailSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', ResultSchema);