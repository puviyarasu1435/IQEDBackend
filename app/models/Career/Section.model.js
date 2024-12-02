const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SectionSchema = new Schema({
  index: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  lesson: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lessons",
    },
  ],
  totalLessons: {
    type: Number,
    required: true,
  },
});

const SectionModel = mongoose.model("Section", SectionSchema);
module.exports = SectionModel;
