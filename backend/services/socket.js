const { Server } = require('socket.io');

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    },
    logger: {
      debug: false,
      info: false,
      warn: true,
      error: true
    }
  });

  io.on('connection', (socket) => {
    socket.on('disconnect', () => {
    });
  });

  return io;
};

module.exports = { initSocket }; 