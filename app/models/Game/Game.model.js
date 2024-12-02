const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GameSessionSchema = new Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    Game: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    
  },
  { timestamps: true }
);



const GameSession = mongoose.model("GameSession", GameSessionSchema);
module.exports = GameSession;
