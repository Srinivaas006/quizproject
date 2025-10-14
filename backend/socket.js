const Quiz = require('./models/Quiz');
const Result = require('./models/Result');

module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('joinQuiz', async ({ sessionCode, name }) => {
      const quiz = await Quiz.findOne({ sessionCode });
      if (!quiz) return socket.emit('error', 'Invalid code');
      socket.join(sessionCode);
      socket.emit('startQuiz', {
        questions: quiz.questions,
        timePerQuestion: quiz.timePerQuestion,
      });
      // Initialize state for this socket
      socket.data = {
        participantName: name,
        correct: 0,
        incorrect: 0
      };
    });

    socket.on('answer', async ({ sessionCode, questionIndex, selectedIndex, name }) => {
      const quiz = await Quiz.findOne({ sessionCode });
      if (!quiz) return;
      const correctIndex = quiz.questions[questionIndex].correctIndex;
      // Record correct/incorrect for the socket
      if (selectedIndex === correctIndex) socket.data.correct++;
      else socket.data.incorrect++;
    });

    socket.on('nextQuestion', async ({ sessionCode, questionIndex }) => {
      const quiz = await Quiz.findOne({ sessionCode });
      // Send next question if there is one
      if (quiz.questions[questionIndex]) {
        socket.emit('nextQuestion', {
          questionIndex,
          text: quiz.questions[questionIndex].text,
          options: quiz.questions[questionIndex].options
        });
      } else {
        // If no more questions, finish quiz
        socket.emit('finishQuiz', { sessionCode });
      }
    });

    socket.on('finishQuiz', async ({ sessionCode }) => {
      const { participantName, correct, incorrect } = socket.data;
      await new Result({
        sessionCode,
        participantName,
        correctCount: correct,
        incorrectCount: incorrect
      }).save();
      socket.emit('quizResults', {
        correctCount: correct,
        incorrectCount: incorrect
      });
    });
  });
};
