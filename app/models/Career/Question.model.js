const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["text-text", "text-image"],
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    questionImage: {
      type: String,
      required: function () {
        return this.type === "text-image";
      },
    },
    options: [
      {
        type: {
          type: String,
          enum: ["text", "image"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
      },
    ],
    correctAnswer: {
      type: {
        type: String,
        enum: ["text", "image"],
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      index: {
        type: Number,
        required: true,
      },
      explanation: {
        type: String,
      },
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    topics: [
      {
        type: Schema.Types.ObjectId,
        ref: "Topics",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);



const QuestionModel = mongoose.model("Question", QuestionSchema);
module.exports = QuestionModel;
