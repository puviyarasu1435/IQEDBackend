const { Server } = require("socket.io");

const rooms = {};
const SocketConnection = (server) => {
    const io = new Server(server, {
        cors: {
          origin: "http://localhost:5173",
          methods: ["GET", "POST"],
          credentials: true,
        },
      });
  io.on("connection", (socket) => {
    console.log("User", socket.id);
    socket.on("test", () => {
      console.log("User", socket.id);
    });

    socket.on("create-room", ({ playerData }, callback) => {
      const roomId = Math.random().toString(36).substring(2, 8);
      rooms[roomId] = { players: [], gameStarted: false };
      socket.join(roomId);
      rooms[roomId].players.push({ Name: playerData });
      console.log(`Room created: ${roomId}`);
      callback({ roomId, playerList: rooms[roomId].players });
    });

    socket.on("join-room", ({ roomId, Name }, callback) => {
      if (rooms[roomId]) {
        if (rooms[roomId].gameStarted) {
          callback({ error: "Game already started in this room!" });
          return;
        }
        socket.join(roomId);
        rooms[roomId].players.push({ Name });
        console.log(`User ${socket.id} joined room ${roomId}`);
        io.to(roomId).emit("room-updated", {
          playersList: rooms[roomId].players,
        });
        callback({ success: true });
      } else {
        callback({ error: "Room not found!" });
      }
    });

    socket.on("start-game", (roomId, callback) => {
        if (rooms[roomId]) {
          rooms[roomId].gameStarted = true;
          io.to(roomId).emit("game-started", { message: "Game has started!" });
          console.log(`Game started in room ${roomId}`);
          callback({ success: true });
        } else {
          callback({ error: "Room not found!" });
        }
      });
      
    socket.on("disconnect", () => {
      console.log("A user disconnected!");
    });
  });
};

module.exports = SocketConnection;
