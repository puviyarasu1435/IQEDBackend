const mongoose = require("mongoose");

const ChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  productName: {
    type: String,
    trim: true,
    require: true,
  },
  banner: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    trim: true,
  },
  sponsoreName: {
    type: String,
  },
  eligibleGem: {
    type: Number,
    default: 1,
    min: 0,
  },
  TestTime: {
    type: Number,
    default: 5,
    min: 0,
  },
  QuestionCount: {
    type: Number,
    default: 1,
    min: 1,
  },
  Active: {
    type: Boolean,
    default: true,
  },
  participantsCount: {
    type: Number,
    default: 1,
    min: 0,
  },
  Winners: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  Topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    require: true,
  },
});



const ChallengeModel = mongoose.model("Challenge", ChallengeSchema);
module.exports = ChallengeModel;
