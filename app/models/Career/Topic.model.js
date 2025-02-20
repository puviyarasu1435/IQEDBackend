const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TopicSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  OneMinuteEqual: {
    type: Number,
    required: true,
    default: 1,
    min: 0.01,
  },
});

const TopicModel = mongoose.model("Topics", TopicSchema);
module.exports = TopicModel;
