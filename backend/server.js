const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const { db, supabase } = require('./db');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Enable CORS for web clients
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Setup Socket.io Server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

// Socket.io Connection & Real-Time Trading Rooms
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('JOIN_ROOM', ({ roomId, userName }) => {
    socket.join(roomId);
    io.to(roomId).emit('USER_JOINED', { userName, roomId, time: new Date().toISOString() });
  });

  socket.on('SEND_MESSAGE', (data) => {
    const { roomId, senderId, senderName, text } = data;
    const msgObj = {
      id: `msg-${Date.now()}`,
      roomId,
      senderId,
      senderName,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    db.addChatMessage(msgObj);
    io.to(roomId).emit('RECEIVE_MESSAGE', msgObj);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Register API Routes
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', ticketRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'TicketX Universal Ticket Trading Backend',
    timestamp: new Date().toISOString(),
    bcryptProtected: true,
    supabaseDatabase: 'Active Supabase Postgres Storage Layer',
    socketIO: 'Active Live Stream'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 TicketX Backend Server running on http://localhost:${PORT}`);
  console.log(`⚡ Socket.io enabled for real-time live trading and chat`);
});
