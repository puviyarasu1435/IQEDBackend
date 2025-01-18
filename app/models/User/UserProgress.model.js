const mongoose = require("mongoose");

const UserProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Course",
  },
  currentUnit: { type: Number, default: 0 },
  currentLesson: { type: Number, default: 0 },
  currentTopic: { type: Number, default: 0 },
  progress: { type: Number, default: 0 }, // Percentage of course completion
});

const UserProgress = mongoose.model("UserProgress", UserProgressSchema);
module.exports = UserProgress;
