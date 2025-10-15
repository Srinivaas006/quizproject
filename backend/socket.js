const Quiz = require('./models/Quiz');
const Result = require('./models/Result');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    socket.on('joinQuiz', async ({ sessionCode, name }) => {
      console.log(`Join request: code=${sessionCode}, name="${name}"`);

      try {
        const quiz = await Quiz.findOne({ sessionCode });
        if (!quiz) {
          console.log('Quiz not found for code:', sessionCode);
          return socket.emit('error', 'Invalid session code');
        }

        if (!name || name.trim() === '') {
          console.log('No name provided');
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

        console.log(`SUCCESS: ${name.trim()} joined quiz`);

        socket.emit('startQuiz', {
          questions: quiz.questions,
          timePerQuestion: quiz.timePerQuestion,
        });

      } catch (error) {
        console.error('Error in joinQuiz:', error);
        socket.emit('error', 'Server error');
      }
    });

    socket.on('answer', async ({ sessionCode, questionIndex, selectedIndex, name }) => {
      try {
        const quiz = await Quiz.findOne({ sessionCode });
        if (!quiz) return;
        
        const question = quiz.questions[questionIndex];
        if (!question) return;

        // Prevent duplicate processing
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

        console.log(`${name} - Q${questionIndex + 1}: ${result} (${points >= 0 ? '+' : ''}${points}) | Score: ${socket.data.score} | Processed: ${socket.data.processedQuestions.length}/${socket.data.totalQuestions}`);

        // Auto-finish when ALL questions are processed
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

        // Get final counts from answers array
        const finalCorrect = data.answers.filter(a => a.result === 'Correct').length;
        const finalIncorrect = data.answers.filter(a => a.result === 'Incorrect').length;
        const finalNotAttempted = data.answers.filter(a => a.result === 'Not Attempted').length;

        console.log(`\n=== FINISHING QUIZ FOR ${data.participantName} ===`);
        console.log(`Final counts: Correct=${finalCorrect}, Incorrect=${finalIncorrect}, NotAttempted=${finalNotAttempted}`);

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

        console.log(`Results for ${results.participantName}: Score ${data.score}/${data.totalQuestions}`);
        console.log(`======================\n`);

        await new Result(results).save();
        socket.emit('quizResults', results);

      } catch (error) {
        console.error('Error finishing quiz:', error);
        socket.emit('error', 'Failed to save results');
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
