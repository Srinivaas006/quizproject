require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const http = require('http')
const setupSockets = require('./socket')
const authRoutes = require('./routes/auth')
const quizRoutes = require('./routes/quizzes')

const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server, { cors: { origin: '*' } })

setupSockets(io)

const allowedOrigins = [
  'http://localhost:3000',
  'https://quizproject-5.onrender.com',
  process.env.FRONTEND_URL
]

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/quizzes', quizRoutes)

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('db connected'))
  .catch(err => console.log('db error', err))

const PORT = process.env.PORT || 5000
server.listen(PORT, '0.0.0.0', () => {
  console.log('running on port', PORT)
})