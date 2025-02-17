const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  type: {
    type: String,
    required: true,
    enum: ["bug", "general", "suggestQuestions"],
  },
  imageList: [
    {
      type: String,
    },
  ],
  feedback: {
    type: String,
  },
  suggestQuestions: {
    type: mongoose.Schema.Types.Mixed,
  },
  Approved: { type: Boolean, default: false },
  createAt: { type: Date, default: Date.now },
});

const FeedbackModel = mongoose.model("Feedback", FeedbackSchema);
module.exports = FeedbackModel;
