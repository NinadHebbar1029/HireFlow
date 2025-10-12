require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./config/database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Make io accessible to routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Test database connection
db.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/job-seekers', require('./routes/jobSeekers'));
app.use('/api/recruiters', require('./routes/recruiters'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/face-recognition', require('./routes/faceRecognition'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/activity', require('./routes/activity'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
