const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",   // or restrict to your domains
    methods: ["GET", "POST"]
  }
});

// This object will store the latest location for each user
let userLocations = {};

// Handle new connections from clients (mobile apps and the website)
io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    // Listen for 'sendLocation' messages from the mobile app
    socket.on('sendLocation', (data) => {
        // Store the new location data, using the user's ID as the key
        userLocations[data.id] = data;
        
        // Broadcast the updated list of all user locations to everyone connected
        // The website will listen for this 'locationUpdate' event
        io.emit('locationUpdate', userLocations);
    });

    // Handle when a client disconnects
    socket.on('disconnect', () => {
        console.log('A client disconnected:', socket.id);
        // You could add logic here to remove a user's location if they disconnect
    });
});

// This serves the `index.html` file when someone visits the server's URL
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT,'0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
