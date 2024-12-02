const mongoose = require("mongoose");

const QuestSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true, 
  },
  description: { 
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["timeBased", "valueBased", "taskBased"], 
  },
  params: {
    type: mongoose.Schema.Types.Mixed, 
    required: true,
  },
  reward: {
    type: {
      type: String,
      required: true,
    },
    value: {
      type: Number, 
      default: 0,
      min: 0, 
    },
  },
});

const QuestModel = mongoose.model("Quest", QuestSchema);
module.exports = QuestModel;