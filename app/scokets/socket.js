const { Server } = require("socket.io");
const { GameSessionModel, QuestionModel, TopicModel } = require("../models");

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
      socket.join(roomId);
      rooms[roomId] = { players: [], gameStarted: false, roomId: roomId };
      rooms[roomId].players.push({ Name: playerData, SocketId: socket.id });
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
        rooms[roomId].players.push({ Name: Name, SocketId: socket.id });
        console.log(`User ${socket.id} joined room ${roomId}`);
        io.to(roomId).emit("room-updated", {
          playersList: rooms[roomId].players,
        });
        callback({ success: true });
      } else {
        callback({ error: "Room not found!" });
      }
    });

    socket.on("start-game", async ({ roomId, UserId, TopicId="674be07aacefccaba22b165f" }, callback) => {
      if (rooms[roomId]) {
        rooms[roomId].gameStarted = true;
        const topic = await TopicModel.findById(TopicId);
        const questionsList = await QuestionModel.aggregate([
          { $match: { topics:topic._id } }, // Match topic ID
          { $sample: { size: 3 } }, // Randomly sample questions
        ]);
        
        if (questionsList.length > 0) {
          const session = new GameSessionModel({
            host: UserId,
            RoomId:roomId, // Example host ID
            Players: rooms[roomId].players,
            questionsList: questionsList, // Add logic to populate questions later
            Topic: TopicId, // Default topic; replace with real value
            questionCount: 3,
          });
          session.save();
          io.to(roomId).emit("game-started", {roomId:roomId,GameSession: session });
          console.log(`Game started in room ${roomId}`);
        }
        callback({ success: true });
      } else {
        callback({ error: "Room not found!" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      for (const roomId in rooms) {
        const room = rooms[roomId];
        const playerIndex = room.players.findIndex(
          (player) => player.SocketId === socket.id
        );
        if (playerIndex !== -1) {
          const [removedPlayer] = room.players.splice(playerIndex, 1);
          console.log(
            `Player ${removedPlayer.Name} removed from room ${roomId}`
          );

          // Notify remaining players in the room
          io.to(roomId).emit("room-updated", {
            playersList: room.players,
          });
          io.to(roomId).emit("user-disconnected", {
            message: `${removedPlayer.Name} has disconnected.`,
          });
          // Delete the room if no players are left
          if (room.players.length === 0) {
            delete rooms[roomId];
            console.log(`Room ${roomId} deleted as it is now empty`);
          }
        }
      }
    });
  });
};

module.exports = SocketConnection;
