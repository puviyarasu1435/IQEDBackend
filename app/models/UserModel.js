const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
      trim: true,
    },
    ProfileImage: {
        fileName: String,
        base64:String
      },
    UserName: {
      type: String,
      trim: true,
    },
    Email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    Age: {
      type: Number,
      required: true,
      min: 0,
    },
    Password: {
      type: String,
      required: true,
    },
    School_Name: {
      type: String,
      trim: true,
    },
    Grade: {
      type: String,
      trim: true,
    },
    Mobile_Number: {
      type: String,
      trim: true,
    },
    Streak: {
      type: Number,
      default: 0,
      min: 0,
    },
    IQGems: {
      type: Number,
      default: 0,
      min: 0,
    },
    Rank: {
      type: Number,
      min: 1,
    },
    XP: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastStreakUpdate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
