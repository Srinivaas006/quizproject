const mongoose = require('mongoose')

const resultSchema = new mongoose.Schema({
  sessionCode: String,
  participantName: String,
  totalScore: Number,
  maxPossibleScore: Number,
  correctCount: Number,
  incorrectCount: Number,
  notAttemptedCount: Number,
  totalQuestions: Number,
  accuracyPercentage: Number,
  grade: String,
  detailedAnswers: Array
})

module.exports = mongoose.model('Result', resultSchema)