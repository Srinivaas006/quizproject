require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketHandler = require('./socket');
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quizzes');

const app = express();
const server = http.createServer(app);

// Allowed origins — never use '*' in production
const allowedOrigins = [
  'http://localhost:3000',
  'https://quizproject-5.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean)

// Fix: Socket.IO CORS now uses the same allowedOrigins list, not '*'
const io = require('socket.io')(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

socketHandler(io);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('CORS: origin not allowed'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.set('trust proxy', 1) 

app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);

// Global error handler — prevents unhandled crashes from leaking stack traces
// Global error handler — prevents unhandled crashes from leaking stack traces

// Global error handler — prevents unhandled crashes from leaking stack traces

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});