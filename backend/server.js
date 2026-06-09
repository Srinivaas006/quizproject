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

// allow all origins — fixes blank page / CORS errors
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }))

app.use(express.json())

// health check endpoint — used by keep-alive ping
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }))

app.use('/api/auth', authRoutes)
app.use('/api/quizzes', quizRoutes)

// better mongo connection options to avoid timeout
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
})
  .then(() => console.log('db connected'))
  .catch(err => console.log('db error', err))

// reconnect if connection drops
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected — reconnecting...')
  setTimeout(() => mongoose.connect(process.env.MONGO_URI), 3000)
})

const PORT = process.env.PORT || 5000
server.listen(PORT, '0.0.0.0', () => {
  console.log('running on port', PORT)
})