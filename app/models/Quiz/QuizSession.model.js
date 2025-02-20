const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuizSessionSchema = new Schema(
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
    type: {
      type: String,
      enum: ["Quiz", "Challenge", "LevelTest"],
      default: "Quiz",
    },
    questionsList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
    ],
    careerPath: {
      Level: { type: mongoose.Schema.Types.ObjectId, ref: "Level" },
      Lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson1" },
      Topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
    },
    Challenge: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge" },
    Topics: {
      type: String,
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
    questionCount: {
      type: Number,
      required: true,
      min: 1,
    },
    score: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number,
      default: 0,
    },
    OneMinuteEqual: {
      type: Number,
      required: true,
      default: 1,
      min: 0.01,
    },
  },
  {
    timestamps: {
      currentTime: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
    },
  }
);

const QuizSession = mongoose.model("QuizSession", QuizSessionSchema);
module.exports = QuizSession;
