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
    valueBaseQuest: {
      Quest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quest",
        required: true,
      },
      progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      isCompleted: {
        type: Boolean,
        default: false,
      },
    },
    earnings: {
      streak: {
        count: {
          type: Number,
          default: 1,
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
        default: 10,
        min: 0,
      },
    },
    careerPathProgress: {
      sections: [
        {
          sectionId: { type: Schema.Types.ObjectId, ref: "Section" },
          isCompleted: { type: Boolean, default: false },
          lessons: [
            {
              lessonId: { type: Schema.Types.ObjectId, ref: "Lessons" },
              isCompleted: { type: Boolean, default: false },
              topics: [
                {
                  topicId: { type: Schema.Types.ObjectId, ref: "Topics" },
                  isCompleted: { type: Boolean, default: false },
                },
              ],
            },
          ],
        },
      ],
    },
    CompletedTopic: [
      {
        type: Schema.Types.ObjectId,
        ref: "Topics",
      },
    ],
    AchivedQuest:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quest",
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("auth.password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.auth.password = await bcrypt.hash(this.auth.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
