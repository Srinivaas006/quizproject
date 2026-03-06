const Quiz = require('./models/Quiz');
const Result = require('./models/Result');

// Track lobby state
const lobbies = {};

// Track live scores per session: { [sessionCode]: { [socketId]: { name, score, correct, incorrect } } }
const liveScores = {};

function getSortedLeaderboard(sessionCode) {
  if (!liveScores[sessionCode]) return [];
  return Object.values(liveScores[sessionCode])
    .sort((a, b) => b.score - a.score || b.correct - a.correct)
    .map((s, i) => ({ rank: i + 1, name: s.name, score: s.score, correct: s.correct, incorrect: s.incorrect }));
}

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // ─── TEACHER joins lobby (from Lobby page) ─────────────────────────────
    socket.on('teacherJoinLobby', ({ sessionCode }) => {
      console.log(`Teacher joined lobby for: ${sessionCode}`);
      socket.join(sessionCode);

      if (!lobbies[sessionCode]) {
        lobbies[sessionCode] = { teacherSocketId: socket.id, students: [] };
      } else {
        lobbies[sessionCode].teacherSocketId = socket.id;
      }

      socket.emit('lobbyUpdate', {
        students: lobbies[sessionCode].students.map(s => s.name)
      });
    });

    // ─── TEACHER joins room (from TeacherLeaderboard page) ────────────────
    socket.on('teacherJoinRoom', ({ sessionCode }) => {
      console.log(`Teacher joined room for leaderboard: ${sessionCode}`);
      socket.join(sessionCode);

      // Send current leaderboard immediately if data exists
      const currentLeaderboard = getSortedLeaderboard(sessionCode);
      if (currentLeaderboard.length > 0) {
        socket.emit('liveLeaderboard', { leaderboard: currentLeaderboard, questionIndex: 0 });
      }
    });

    // ─── STUDENT joins quiz ────────────────────────────────────────────────
    socket.on('joinQuiz', async ({ sessionCode, name }) => {
      console.log(`Join request: code=${sessionCode}, name="${name}"`);

      try {
        const quiz = await Quiz.findOne({ sessionCode });
        if (!quiz) return socket.emit('error', 'Invalid session code');
        if (!name || name.trim() === '') return socket.emit('error', 'Name is required');

        socket.join(sessionCode);

        socket.data = {
          participantName: name.trim(),
          sessionCode,
          score: 0,
          correct: 0,
          incorrect: 0,
          notAttempted: 0,
          totalQuestions: quiz.questions.length,
          answers: [],
          processedQuestions: []
        };

        // Init lobby
        if (!lobbies[sessionCode]) {
          lobbies[sessionCode] = { teacherSocketId: null, students: [] };
        }

        // Init live scores
        if (!liveScores[sessionCode]) liveScores[sessionCode] = {};
        liveScores[sessionCode][socket.id] = { name: name.trim(), score: 0, correct: 0, incorrect: 0 };

        // Avoid duplicates in lobby
        if (!lobbies[sessionCode].students.find(s => s.id === socket.id)) {
          lobbies[sessionCode].students.push({ id: socket.id, name: name.trim() });
        }

        console.log(`SUCCESS: ${name.trim()} joined. Total: ${lobbies[sessionCode].students.length}`);

        socket.emit('waitingForTeacher', {
          students: lobbies[sessionCode].students.map(s => s.name)
        });

        io.to(sessionCode).emit('lobbyUpdate', {
          students: lobbies[sessionCode].students.map(s => s.name)
        });

      } catch (error) {
        console.error('Error in joinQuiz:', error);
        socket.emit('error', 'Server error');
      }
    });

    // ─── TEACHER starts quiz ───────────────────────────────────────────────
    socket.on('teacherStartQuiz', async ({ sessionCode }) => {
      try {
        const quiz = await Quiz.findOne({ sessionCode });
        if (!quiz) return;

        let count = 3;
        const countdownInterval = setInterval(() => {
          io.to(sessionCode).emit('countdown', { count });
          count--;
          if (count < 0) {
            clearInterval(countdownInterval);
            io.to(sessionCode).emit('startQuiz', {
              questions: quiz.questions,
              timePerQuestion: quiz.timePerQuestion,
            });
            socket.emit('quizStarted');
          }
        }, 1000);

      } catch (error) {
        console.error('Error starting quiz:', error);
      }
    });

    // ─── STUDENT answers ───────────────────────────────────────────────────
    socket.on('answer', async ({ sessionCode, questionIndex, selectedIndex, name }) => {
      try {
        const quiz = await Quiz.findOne({ sessionCode });
        if (!quiz) return;

        const question = quiz.questions[questionIndex];
        if (!question) return;

        if (socket.data.processedQuestions.includes(questionIndex)) return;
        socket.data.processedQuestions.push(questionIndex);

        const correctIndex = question.correctIndex;
        let points = 0;
        let result = '';

        if (selectedIndex === null || selectedIndex === undefined) {
          points = 0; result = 'Not Attempted'; socket.data.notAttempted++;
        } else if (selectedIndex === correctIndex) {
          points = 1; result = 'Correct'; socket.data.correct++;
        } else {
          points = -1; result = 'Incorrect'; socket.data.incorrect++;
        }

        socket.data.score += points;

        socket.data.answers.push({
          questionNumber: questionIndex + 1,
          question: question.text,
          yourAnswer: selectedIndex !== null ? question.options[selectedIndex] : 'Not Attempted',
          correctAnswer: question.options[correctIndex],
          result,
          points,
          totalScore: socket.data.score
        });

        // Update live scores
        if (liveScores[sessionCode] && liveScores[sessionCode][socket.id]) {
          liveScores[sessionCode][socket.id].score = socket.data.score;
          liveScores[sessionCode][socket.id].correct = socket.data.correct;
          liveScores[sessionCode][socket.id].incorrect = socket.data.incorrect;
        }

        console.log(`${name} - Q${questionIndex + 1}: ${result} | Score: ${socket.data.score}`);

        // Broadcast live leaderboard to EVERYONE in the room (students + teacher)
        const currentLeaderboard = getSortedLeaderboard(sessionCode);
        io.to(sessionCode).emit('liveLeaderboard', { leaderboard: currentLeaderboard, questionIndex });

        // Auto-finish when all questions done
        if (socket.data.processedQuestions.length === socket.data.totalQuestions) {
          setTimeout(() => {
            socket.emit('finishQuiz', { sessionCode });
          }, 500);
        }

      } catch (error) {
        console.error('Error processing answer:', error);
      }
    });

    // ─── Next question ─────────────────────────────────────────────────────
    socket.on('nextQuestion', async ({ sessionCode, questionIndex }) => {
      try {
        const quiz = await Quiz.findOne({ sessionCode });
        if (!quiz) return;
        if (questionIndex < quiz.questions.length) {
          socket.emit('nextQuestion', {
            questionIndex,
            text: quiz.questions[questionIndex].text,
            options: quiz.questions[questionIndex].options
          });
        }
      } catch (error) {
        console.error('Error in nextQuestion:', error);
      }
    });

    // ─── STUDENT finishes quiz ─────────────────────────────────────────────
    socket.on('finishQuiz', async ({ sessionCode }) => {
      try {
        const data = socket.data;
        if (!data || !data.participantName) return socket.emit('error', 'Session data not found');

        const finalCorrect = data.answers.filter(a => a.result === 'Correct').length;
        const finalIncorrect = data.answers.filter(a => a.result === 'Incorrect').length;
        const finalNotAttempted = data.answers.filter(a => a.result === 'Not Attempted').length;
        const percentage = data.totalQuestions > 0 ? Math.round((finalCorrect / data.totalQuestions) * 100) : 0;

        let grade = 'F';
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B';
        else if (percentage >= 60) grade = 'C';
        else if (percentage >= 50) grade = 'D';

        const results = {
          participantName: data.participantName,
          sessionCode,
          totalScore: data.score,
          maxPossibleScore: data.totalQuestions,
          correctCount: finalCorrect,
          incorrectCount: finalIncorrect,
          notAttemptedCount: finalNotAttempted,
          totalQuestions: data.totalQuestions,
          accuracyPercentage: percentage,
          grade,
          detailedAnswers: data.answers
        };

        await new Result(results).save();

        // Final leaderboard
        const finalLeaderboard = getSortedLeaderboard(sessionCode);

        // Send results + leaderboard to student
        socket.emit('quizResults', { ...results, leaderboard: finalLeaderboard });

        // Broadcast final leaderboard to everyone in room (teacher sees it too)
        io.to(sessionCode).emit('finalLeaderboard', { leaderboard: finalLeaderboard });

        // Cleanup lobby
        if (lobbies[sessionCode]) {
          lobbies[sessionCode].students = lobbies[sessionCode].students.filter(s => s.id !== socket.id);
        }

      } catch (error) {
        console.error('Error finishing quiz:', error);
        socket.emit('error', 'Failed to save results');
      }
    });

    // ─── Disconnect ────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      for (const code in lobbies) {
        lobbies[code].students = lobbies[code].students.filter(s => s.id !== socket.id);
        io.to(code).emit('lobbyUpdate', { students: lobbies[code].students.map(s => s.name) });
      }
      for (const code in liveScores) {
        delete liveScores[code][socket.id];
      }
    });
  });
};