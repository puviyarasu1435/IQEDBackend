const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const UserSchema = new Schema(
  {
    auth: {
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true, // Ensures no duplicate emails
      },
      password: {
        type: String,
        required: true, // Store hashed passwords
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    userName: {
      type: String,
      trim: true,
      unique: true, // Ensures unique usernames
      sparse: true, // Allows null values for unique fields
    },
    age: {
      type: Number,
      required: true,
      min: 0,
    },
    parentsName: {
      type: String,
    },
    schoolName: {
      type: String,
      trim: true,
    },
    grade: {
      type: String,
      trim: true,
    },
    mobileNumber: {
      type: String,
      trim: true,
    },
    earnings: {
      streak: {
        count: {
          type: Number,
          default: 0,
          min: 0,
        },
        lastUpdate: {
          type: Date,
          default: Date.now,
        },
      },
      iqGems: {
        type: Number,
        default: 10,
        min: 0,
      },
      rank: {
        type: Number,
        default: null,
        min: 1,
      },
      xp: {
        type: Number,
        default: 100,
        min: 0,
      },
    },
    CourseProgress: {
      type: Schema.Types.ObjectId,
      ref: "UserProgress",
    },
    CompletedTopic: [
      {
        type: Schema.Types.ObjectId,
        ref: "Topics",
      },
    ],
    XPQuests: {
      StepUpValue: {
        type: Number,
        default: 1000,
        min: 1,
      },
      CurrentValue: {
        type: Number,
        default: 0,
        min: 0,
      },
      targetValue: {
        type: Number,
        default: 500,
        min: 0,
      },
      rewardGem: {
        type: Number,
        default: 10,
        min: 1,
      },
    },
    StreakQuest: {
      StepUpValue: {
        type: Number,
        default: 7,
        min: 1,
      },
      CurrentValue: {
        type: Number,
        default: 0,
        min: 0,
      },
      targetValue: {
        type: Number,
        default: 1,
        min: 0,
      },
      rewardGem: {
        type: Number,
        default: 10,
        min: 1,
      },
    },
  },
  {
    timestamps: {
      currentTime: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
    },
  }
);

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
