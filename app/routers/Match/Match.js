const { Server } = require("socket.io");
const MatchSessionModel = require("../../models/MatchModel");
const UserModel = require("../../models/UserModel");

const questions = [
  { question: "What is 2 + 2?", options: ["2", "3", "4", "5"], answer: "4" },
  {
    question: "What is the capital of France?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    answer: "Paris",
  },
];

function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("createRoom", async (arg, callback) => {
      const roomCode = generateRoomCode();
      const user = await UserModel.findById(arg);
      console.log(`Connected: ${socket.id}`);
      const newRoom = new MatchSessionModel({
        roomCode,
        players: [{ PlayerId: arg,PlayerName:user.UserName, PlayerType: "User",SoccketID:socket.id }],
        questionList: questions.map((q, index) => ({ ...q, _id: index })),
      });
      await newRoom.save();
      socket.join(roomCode);
      callback({
        HostId: arg,
        roomCode: roomCode,
        Name: user.UserName,
        Sessionid: newRoom._id,
        Type:"User"
      });
    });

    socket.on("GuestjoinRoom", async (arg, callback) => {
      const MatchSession = await MatchSessionModel.findOne({ roomCode: arg.RoomCode });
      if (!MatchSession) {
        socket.emit("error", { message: "Room not found" });
        return;
      }
      if(MatchSession.players.length<2){
        MatchSession.players.push({ PlayerName: arg.PlayerName, PlayerType: "Guest",SoccketID:socket.id });
        await MatchSession.save();
        socket.join(arg.RoomCode);
        callback({
          HostId: MatchSession.players[0].PlayerId,
          roomCode: arg.RoomCode,
          Name: arg.PlayerName,
          Sessionid: MatchSession._id,
          Type:"Guest"
      });
      io.to(arg.RoomCode).emit("playerJoined", MatchSession.players);
      }
    });

    socket.on("startRound", async (roomCode) => {
      const room = await MatchSessionModel.findOne({ roomCode });
      if (room && room.players[0].PlayerId.toString() === socket.id) {
        const currentQuestion = questions[room.currentQuestionIndex];
        io.to(roomCode).emit("newQuestion", currentQuestion);
      }
    });

    socket.on("submitAnswer", async ({ roomCode, answer, UserId }) => {
      const room = await MatchSessionModel.findOne({ roomCode });
      if (room) {
        const currentQuestion = questions[room.currentQuestionIndex];
        if (answer === currentQuestion.answer) {
          const player = room.players.find(
            (p) => p.playerId.toString() === UserId
          );
          player.score += 10;
          await room.save();

          io.to(roomCode).emit("updatePlayers", room.players);
          io.to(roomCode).emit("correctAnswer", { playerId: UserId, answer });
        }
      }
    });

    socket.on("disconnect", async () => {
      const rooms = await MatchSessionModel.find();
      for (const room of rooms) {
        if (room.players.length === 0) {
          await MatchSessionModel.deleteOne({ roomCode: room.roomCode });
        }else{
          for(const player of room.players){    
              if(player.SoccketID == socket.id && player.PlayerType != "User"){
                room.players.pop(player)
                room.save();
                break;
              }else if(player.SoccketID == socket.id && player.PlayerType == "User"){
                room.status  = "end";
                room.save();
              }
          }
        }
        
      }
      console.log(`Player ${socket.id} disconnected`);
    });
  });
};
