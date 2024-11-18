const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuizSessionSchema = new Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the host user
    },
    status: {
      type: String,
      enum: ["pending","completed"],
      default: "pending",
    },
    questionsList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
    ],
    categories: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    answeredQuestions: {
      type: Map,
      of: String, // Each quizId maps directly to an answer string
      default: {},
    },
    questionCount: {
      type: Number,
      required: true,
      min: 1,
    },
    score: {
      type: Number,
      default: 0,
    },
    createTime: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


const QuizSession = mongoose.model("QuizSession", QuizSessionSchema);
module.exports = QuizSession;