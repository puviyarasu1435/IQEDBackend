const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GameSessionSchema = new Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    RoomId:{
      type: String,
      required: true,
    },
    Players: [
      {
        SocketId: {
          type: String,
          required: true,
        },
        Name: {
          type: String,
        },
        score: {
          type: Number,
          default: 0,
        },
        timeTaken: {
          type: Number,
          default: 0,
        },
        status: {
          type: String,
          enum: ["pending", "completed"],
          default: "pending",
        },
        answeredQuestions: [
          {
            questionId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Question",
              required: true,
            },
            answer: {
              type: String,
              required: true,
            },
            correct: {
              type: Boolean,
              default: false,
            },
          },
        ],
      },
    ],
    questionsList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
    ],
    Topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topics",
    },

    questionCount: {
      type: Number,
      required: true,
      min: 1,
    },
    Winner: {
      type: Number,
      default: -1,
    },
  },
  { timestamps: true }
);

const GameSession = mongoose.model("GameSession", GameSessionSchema);
module.exports = GameSession;
