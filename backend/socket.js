const Quiz = require('./models/Quiz');
const Result = require('./models/Result');

// Track lobby state: { [sessionCode]: { teacherSocketId, students: [{id, name}] } }
const lobbies = {};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // ─── TEACHER joins lobby after creating quiz ───────────────────────────
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

    socket.on('joinQuiz', async ({ sessionCode, name }) => {
      console.log(`Join request: code=${sessionCode}, name="${name}"`);

      try {
        const quiz = await Quiz.findOne({ sessionCode });
        if (!quiz) {
          console.log('Quiz not found for code:', sessionCode);
          return socket.emit('error', 'Invalid session code');
        }

        if (!name || name.trim() === '') {
          return socket.emit('error', 'Name is required');
        }

        socket.join(sessionCode);

        
        socket.data = {
          participantName: name.trim(),
          sessionCode: sessionCode,
          score: 0,
          correct: 0,
          incorrect: 0,
          notAttempted: 0,
          totalQuestions: quiz.questions.length,
          answers: [],
          processedQuestions: []
        };

        if (!lobbies[sessionCode]) {
          lobbies[sessionCode] = { teacherSocketId: null, students: [] };
        }

        
        const alreadyJoined = lobbies[sessionCode].students.find(s => s.id === socket.id);
        if (!alreadyJoined) {
          lobbies[sessionCode].students.push({ id: socket.id, name: name.trim() });
        }

        console.log(`SUCCESS: ${name.trim()} joined lobby. Total: ${lobbies[sessionCode].students.length}`);

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

    socket.on('teacherStartQuiz', async ({ sessionCode }) => {
      console.log(`Teacher starting quiz: ${sessionCode}`);

      try {
        const quiz = await Quiz.findOne({ sessionCode });
        if (!quiz) return;

        let count = 3;
        const countdownInterval = setInterval(() => {
          io.to(sessionCode).emit('countdown', { count });
          console.log(`Countdown: ${count} for ${sessionCode}`);
          count--;

          if (count < 0) {
            clearInterval(countdownInterval);

            io.to(sessionCode).emit('startQuiz', {
              questions: quiz.questions,
              timePerQuestion: quiz.timePerQuestion,
            });

            socket.emit('quizStarted');

            console.log(`Quiz started: ${sessionCode}`);
          }
        }, 1000);

      } catch (error) {
        console.error('Error starting quiz:', error);
      }
    });

    socket.on('answer', async ({ sessionCode, questionIndex, selectedIndex, name }) => {
      try {
        const quiz = await Quiz.findOne({ sessionCode });
        if (!quiz) return;

        const question = quiz.questions[questionIndex];
        if (!question) return;

        if (socket.data.processedQuestions.includes(questionIndex)) {
          console.log(`Duplicate: Q${questionIndex + 1} already processed for ${name}`);
          return;
        }

        socket.data.processedQuestions.push(questionIndex);

        const correctIndex = question.correctIndex;
        let points = 0;
        let result = '';

        if (selectedIndex === null || selectedIndex === undefined) {
          points = 0;
          result = 'Not Attempted';
          socket.data.notAttempted++;
        } else if (selectedIndex === correctIndex) {
          points = 1;
          result = 'Correct';
          socket.data.correct++;
        } else {
          points = -1;
          result = 'Incorrect';
          socket.data.incorrect++;
        }

        socket.data.score += points;

        socket.data.answers.push({
          questionNumber: questionIndex + 1,
          question: question.text,
          yourAnswer: selectedIndex !== null ? question.options[selectedIndex] : 'Not Attempted',
          correctAnswer: question.options[correctIndex],
          result: result,
          points: points,
          totalScore: socket.data.score
        });

        console.log(`${name} - Q${questionIndex + 1}: ${result} (${points >= 0 ? '+' : ''}${points}) | Score: ${socket.data.score}`);

        if (socket.data.processedQuestions.length === socket.data.totalQuestions) {
          setTimeout(() => {
            console.log(`All questions completed for ${socket.data.participantName}`);
            socket.emit('finishQuiz', { sessionCode });
          }, 500);
        }

      } catch (error) {
        console.error('Error processing answer:', error);
      }
    });

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

    
    socket.on('finishQuiz', async ({ sessionCode }) => {
      try {
        const data = socket.data;

        if (!data || !data.participantName) {
          console.error('No participant data found');
          return socket.emit('error', 'Session data not found');
        }

        const finalCorrect = data.answers.filter(a => a.result === 'Correct').length;
        const finalIncorrect = data.answers.filter(a => a.result === 'Incorrect').length;
        const finalNotAttempted = data.answers.filter(a => a.result === 'Not Attempted').length;

        const percentage = data.totalQuestions > 0 ?
          Math.round((finalCorrect / data.totalQuestions) * 100) : 0;

        let grade = 'F';
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B';
        else if (percentage >= 60) grade = 'C';
        else if (percentage >= 50) grade = 'D';

        const results = {
          participantName: data.participantName,
          sessionCode: sessionCode,
          totalScore: data.score,
          maxPossibleScore: data.totalQuestions,
          correctCount: finalCorrect,
          incorrectCount: finalIncorrect,
          notAttemptedCount: finalNotAttempted,
          totalQuestions: data.totalQuestions,
          accuracyPercentage: percentage,
          grade: grade,
          detailedAnswers: data.answers
        };

        await new Result(results).save();
        socket.emit('quizResults', results);

      
        if (lobbies[sessionCode]) {
          lobbies[sessionCode].students = lobbies[sessionCode].students.filter(s => s.id !== socket.id);
        }

      } catch (error) {
        console.error('Error finishing quiz:', error);
        socket.emit('error', 'Failed to save results');
      }
    });

   
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

    
      for (const code in lobbies) {
        lobbies[code].students = lobbies[code].students.filter(s => s.id !== socket.id);
        
        io.to(code).emit('lobbyUpdate', {
          students: lobbies[code].students.map(s => s.name)
        });
      }
    });
  });
};