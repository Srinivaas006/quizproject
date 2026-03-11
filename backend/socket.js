const Quiz = require('./models/Quiz')
const Result = require('./models/Result')

const lobbies = {}
const liveScores = {}

function getSortedLeaderboard(sessionCode) {
  if (!liveScores[sessionCode]) return []
  return Object.values(liveScores[sessionCode])
    .sort((a, b) => b.score - a.score || b.correct - a.correct)
    .map((s, i) => ({
      rank: i + 1,
      name: s.name,
      rollNo: s.rollNo || '',
      dept: s.dept || '',
      score: s.score,
      correct: s.correct,
      incorrect: s.incorrect,
      accuracy: (s.correct + s.incorrect) > 0 ? Math.round(s.correct / (s.correct + s.incorrect) * 100) : 0
    }))
}

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('connected:', socket.id)

    socket.on('teacherJoinLobby', ({ sessionCode }) => {
      socket.join(sessionCode)
      if (!lobbies[sessionCode]) {
        lobbies[sessionCode] = { teacherSocketId: socket.id, students: [] }
      } else {
        lobbies[sessionCode].teacherSocketId = socket.id
      }
      socket.emit('lobbyUpdate', { students: lobbies[sessionCode].students.map(s => s.name) })
    })

    socket.on('teacherJoinRoom', ({ sessionCode }) => {
      socket.join(sessionCode)
      const current = getSortedLeaderboard(sessionCode)
      if (current.length > 0) {
        socket.emit('liveLeaderboard', { leaderboard: current, questionIndex: 0 })
      }
    })

    socket.on('joinQuiz', async ({ sessionCode, name, rollNo, dept, year }) => {
      try {
        const quiz = await Quiz.findOne({ sessionCode })
        if (!quiz) return socket.emit('error', 'Invalid session code')
        if (!name || name.trim() === '') return socket.emit('error', 'Name is required')

        socket.join(sessionCode)

        socket.data = {
          participantName: name.trim(),
          rollNo: rollNo || '',
          dept: dept || '',
          year: year || '',
          sessionCode,
          score: 0,
          correct: 0,
          incorrect: 0,
          notAttempted: 0,
          totalQuestions: quiz.questions.length,
          answers: [],
          processedQuestions: []
        }

        if (!lobbies[sessionCode]) lobbies[sessionCode] = { teacherSocketId: null, students: [] }
        if (!liveScores[sessionCode]) liveScores[sessionCode] = {}

        liveScores[sessionCode][socket.id] = {
          name: name.trim(),
          rollNo: rollNo || '',
          dept: dept || '',
          score: 0,
          correct: 0,
          incorrect: 0
        }

        if (!lobbies[sessionCode].students.find(s => s.id === socket.id)) {
          lobbies[sessionCode].students.push({ id: socket.id, name: name.trim(), rollNo: rollNo || '' })
        }

        socket.emit('waitingForTeacher', { students: lobbies[sessionCode].students.map(s => s.name) })
        io.to(sessionCode).emit('lobbyUpdate', { students: lobbies[sessionCode].students.map(s => s.name) })

      } catch (err) {
        console.log('joinQuiz error', err)
        socket.emit('error', 'Server error')
      }
    })

    socket.on('teacherStartQuiz', async ({ sessionCode }) => {
      try {
        const quiz = await Quiz.findOne({ sessionCode })
        if (!quiz) return
        let count = 3
        const interval = setInterval(() => {
          io.to(sessionCode).emit('countdown', { count })
          count--
          if (count < 0) {
            clearInterval(interval)
            io.to(sessionCode).emit('startQuiz', { questions: quiz.questions, timePerQuestion: quiz.timePerQuestion })
            socket.emit('quizStarted')
          }
        }, 1000)
      } catch (err) {
        console.log('start error', err)
      }
    })

    socket.on('answer', async ({ sessionCode, questionIndex, selectedIndex, name }) => {
      try {
        const quiz = await Quiz.findOne({ sessionCode })
        if (!quiz) return
        const question = quiz.questions[questionIndex]
        if (!question) return
        if (socket.data.processedQuestions.includes(questionIndex)) return
        socket.data.processedQuestions.push(questionIndex)

        const correctIndex = question.correctIndex
        let points = 0
        let result = ''

        if (selectedIndex === null || selectedIndex === undefined) {
          points = 0; result = 'Not Attempted'; socket.data.notAttempted++
        } else if (selectedIndex === correctIndex) {
          points = 1; result = 'Correct'; socket.data.correct++
        } else {
          points = -1; result = 'Incorrect'; socket.data.incorrect++
        }

        socket.data.score += points
        socket.data.answers.push({
          questionNumber: questionIndex + 1,
          question: question.text,
          yourAnswer: selectedIndex !== null ? question.options[selectedIndex] : 'Not Attempted',
          correctAnswer: question.options[correctIndex],
          result, points,
          totalScore: socket.data.score
        })

        if (liveScores[sessionCode] && liveScores[sessionCode][socket.id]) {
          liveScores[sessionCode][socket.id].score = socket.data.score
          liveScores[sessionCode][socket.id].correct = socket.data.correct
          liveScores[sessionCode][socket.id].incorrect = socket.data.incorrect
        }

        const lb = getSortedLeaderboard(sessionCode)
        io.to(sessionCode).emit('liveLeaderboard', { leaderboard: lb, questionIndex })

        if (socket.data.processedQuestions.length === socket.data.totalQuestions) {
          setTimeout(() => socket.emit('finishQuiz', { sessionCode }), 500)
        }
      } catch (err) {
        console.log('answer error', err)
      }
    })

    socket.on('nextQuestion', async ({ sessionCode, questionIndex }) => {
      try {
        const quiz = await Quiz.findOne({ sessionCode })
        if (!quiz) return
        if (questionIndex < quiz.questions.length) {
          socket.emit('nextQuestion', { questionIndex, text: quiz.questions[questionIndex].text, options: quiz.questions[questionIndex].options })
        }
      } catch (err) { console.log(err) }
    })

    socket.on('finishQuiz', async ({ sessionCode }) => {
      try {
        const data = socket.data
        if (!data || !data.participantName) return socket.emit('error', 'Session data not found')

        const finalCorrect = data.answers.filter(a => a.result === 'Correct').length
        const finalIncorrect = data.answers.filter(a => a.result === 'Incorrect').length
        const finalNotAttempted = data.answers.filter(a => a.result === 'Not Attempted').length
        const percentage = data.totalQuestions > 0 ? Math.round(finalCorrect / data.totalQuestions * 100) : 0

        let grade = 'F'
        if (percentage >= 90) grade = 'A+'
        else if (percentage >= 80) grade = 'A'
        else if (percentage >= 70) grade = 'B'
        else if (percentage >= 60) grade = 'C'
        else if (percentage >= 50) grade = 'D'

        const results = {
          participantName: data.participantName,
          rollNo: data.rollNo,
          dept: data.dept,
          year: data.year,
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
        }

        await new Result(results).save()

        const finalLB = getSortedLeaderboard(sessionCode)
        socket.emit('quizResults', { ...results, leaderboard: finalLB })
        io.to(sessionCode).emit('finalLeaderboard', { leaderboard: finalLB })

        if (lobbies[sessionCode]) {
          lobbies[sessionCode].students = lobbies[sessionCode].students.filter(s => s.id !== socket.id)
        }
      } catch (err) {
        console.log('finish error', err)
        socket.emit('error', 'Failed to save results')
      }
    })

    socket.on('disconnect', () => {
      for (const code in lobbies) {
        lobbies[code].students = lobbies[code].students.filter(s => s.id !== socket.id)
        io.to(code).emit('lobbyUpdate', { students: lobbies[code].students.map(s => s.name) })
      }
      for (const code in liveScores) {
        delete liveScores[code][socket.id]
      }
    })
  })
}