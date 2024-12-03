const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuizSessionSchema = new Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    RoomId:{
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    questionsList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
    ],
    careerPath: {
      Section:{
        type: Number,
        required: true,
      },
      Lesson:{
        type: Number,
        required: true,
      },
      Topic:{
        type: Number,
        required: true,
      }
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
  },
  { timestamps: true }
);



const QuizSession = mongoose.model("QuizSession", QuizSessionSchema);
module.exports = QuizSession;
