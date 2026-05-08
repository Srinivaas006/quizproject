const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title: String,
  timePerQuestion: Number,
  questions: [{
    text: String,
    options: [String],
    correctIndex: Number
  }],
  sessionCode: { type: String, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Quiz', QuizSchema);
