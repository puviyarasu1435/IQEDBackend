const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LessonSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  topics: [
    {
      type: Schema.Types.ObjectId,
      ref: "Topics",
      required: true,
    },
  ],
  totalTopic: {
    type: Number,
    required:true
  },
});

const LessonModel = mongoose.model("Lessons", LessonSchema);
module.exports = LessonModel;
