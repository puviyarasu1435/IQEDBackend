const mongoose = require("mongoose");

const careerPathSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    levels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Level" }],
    status: {
      type: String,
      enum: ["draft", "live"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

const levelSchema = new mongoose.Schema({
  name: String,
  description: String,
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson1" }],
  levelNumber: Number,
});

const lessonSchema = new mongoose.Schema({
  name: String,
  description: String,
  lessonNumber: Number,
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topics" }],
});

// Models
const CareerPath = mongoose.model("CareerPath", careerPathSchema);
const Level = mongoose.model("Level", levelSchema);
const Lesson = mongoose.model("Lesson1", lessonSchema);

module.exports = { CareerPath, Level, Lesson };
