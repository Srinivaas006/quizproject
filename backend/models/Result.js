const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  sessionCode: String,
  participantName: String,
  correctCount: Number,
  incorrectCount: Number
});

module.exports = mongoose.model('Result', ResultSchema);
