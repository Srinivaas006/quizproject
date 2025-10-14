require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');

// Import socket handlers
const socketHandler = require('./socket');
// Import API routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quizzes');

const app = express();
const server = http.createServer(app);

// Setup Socket.IO with CORS
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});

// Pass socket instance to handler
socketHandler(io);

app.use(cors());
app.use(express.json());

// Setup auth and quiz API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);

// Connect to Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
