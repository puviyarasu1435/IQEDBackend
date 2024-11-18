const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MatchSessionSchema = new Schema({
  roomCode: { 
    type: String, 
    required: true, 
    unique: true 
},
  players: [
    {
      PlayerName: String,
      PlayerId:{
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      PlayerType:{
        type: String,
        enum: ["Guest", "User"],
        default: "User", 
        require:true,
      },
      score: { type: Number, default: 0 },
      SoccketID:String
    },
  ],
  questionList: [],
  currentQuestionIndex: {
    type: Number,
    default: 0, // Start at the first question
  },
  winner: {
    Name:{
        type:String,
        default: null, 
    }
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["live", "end"],
    default: "live", 
  },
});

const MatchSessionModel = mongoose.model("MatchSession", MatchSessionSchema);
module.exports = MatchSessionModel;
