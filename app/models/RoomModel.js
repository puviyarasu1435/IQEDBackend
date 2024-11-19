const mongoose = require("mongoose");
const QuizModel = require("./QuizModel");
const UserModel = require("./UserModel");

const RoomSchema = new mongoose.Schema({
  hostId: { type: String, required: true }, // Host of the match
  matchCode: { type: String, unique: true, required: true }, // Unique match code for the room
  players: [UserModel], // Array of players in the room
  questions: [QuizModel], // List of questions for the match
  currentQuestionIndex: { type: Number, default: 0 }, // Index to track the current question
  isMatchOpen: { type: Boolean, default: true }, // Flag to check if match is open for new players
  winner: {
    playerId: { type: String, default: null }, // Winner's player ID
    score: { type: Number, default: 0 }, // Winner's score
  },
  createdAt: { type: Date, default: Date.now }, // Room creation date
});

const Room = mongoose.model("Room", RoomSchema);
module.exports = Room;
