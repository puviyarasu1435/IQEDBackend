const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IQSessionSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
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
    IQscore: {
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

const IQSession = mongoose.model("IQSession", IQSessionSchema);
module.exports = IQSession;
