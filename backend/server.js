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
const io = require('socket.io')(server, { cors: { origin: '*' } });

socketHandler(io);

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://quizproject-5.onrender.com',  // Your frontend URL
    process.env.FRONTEND_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});