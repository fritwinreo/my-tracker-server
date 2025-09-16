const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// ✅ Allow cross-origin connections
const io = socketIo(server, {
  cors: {
    origin: "*", // later restrict to your website domain
    methods: ["GET", "POST"]
  }
});

// Store latest locations
let userLocations = {};

// Handle connections
io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    // Debugging listeners
    socket.on("connect_error", (err) => {
        console.error("❌ Connection error:", err.message);
    });

    socket.on("error", (err) => {
        console.error("❌ Socket error:", err);
    });

    // Receive location from Flutter app
    socket.on('sendLocation', (data) => {
        console.log(`📍 Location received from ${data.id}:`, data);
        userLocations[data.id] = data;
        io.emit('locationUpdate', userLocations);
    });

    // Client disconnect
    socket.on('disconnect', () => {
        console.log('⚠️ Client disconnected:', socket.id);
    });
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// ✅ Keep-alive endpoint
app.get('/ping', (req, res) => {
    res.send('pong');
});

// ✅ Debugging endpoint (see connected users)
app.get('/debug', (req, res) => {
    res.json({ connectedUsers: Object.keys(userLocations) });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
