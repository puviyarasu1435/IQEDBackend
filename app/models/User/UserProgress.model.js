const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the user
  careerPath: { type: mongoose.Schema.Types.ObjectId, ref: "CareerPath" },
  levelProgress: [
    {
      level: { type: mongoose.Schema.Types.ObjectId, ref: "Level" },
      completed: { type: Boolean, default: false },
      unlocked: { type: Boolean, default: false },
      finalExamUnlocked: { type: Boolean, default: false },
      finalExamScore: { type: Number, default: null },
      lessonProgress: [
        {
          lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson1" },
          completed: { type: Boolean, default: false },
          unlocked: { type: Boolean, default: false },
          topicProgress: [
            {
              topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topics" },
              completed: { type: Boolean, default: false },
              unlocked: { type: Boolean, default: false },
              score: { type: Number, default: 0 },
              LastSessionTime: { type: Number, default: 0 },
            },
          ],
        },
      ],
    },
  ],
});

userProgressSchema.pre("save", function (next) {
  if (this.levelProgress.length > 0) {
    this.levelProgress[0].unlocked = true;
    if (this.levelProgress[0].lessonProgress.length > 0) {
      this.levelProgress[0].lessonProgress[0].unlocked = true;
      if (this.levelProgress[0].lessonProgress[0].topicProgress.length > 0) {
        this.levelProgress[0].lessonProgress[0].topicProgress[0].unlocked = true;
      }
    }
  }
  next();
});

userProgressSchema.methods.updateProgress = async function () {
  
  for (let i = 0; i < this.levelProgress.length; i++) {
    const level = this.levelProgress[i];
    if (!level.unlocked) break; // Stop if level is locked

    let allLessonsCompleted = true;

    for (let j = 0; j < level.lessonProgress.length; j++) {
      const lesson = level.lessonProgress[j];
      if (!lesson.unlocked) break; // Stop if lesson is locked

      let allTopicsCompleted = true;

      for (let k = 0; k < lesson.topicProgress.length; k++) {
        const topic = lesson.topicProgress[k];

        if (!topic.completed) {
          allTopicsCompleted = false;
          break;
        }

        if (k < lesson.topicProgress.length - 1) {
          lesson.topicProgress[k + 1].unlocked = true;
        }
      }

      if (allTopicsCompleted) {
        lesson.completed = true;

        if (j < level.lessonProgress.length - 1) {
          level.lessonProgress[j + 1].unlocked = true;
          level.lessonProgress[j + 1].topicProgress[0].unlocked = true;
        }
      } else {
        allLessonsCompleted = false;
      }
    }

    if (allLessonsCompleted) {
      level.finalExamUnlocked = true; // Unlock final exam
    }

    // Check if final exam is completed and score is 80% or more
    if (level.finalExamUnlocked && level.finalExamScore !== null) {
      const requiredScore = 60 * 0.8; // 80% of 60 questions
      if (level.finalExamScore >= requiredScore) {
        level.completed = true;
        // Unlock next level
        if (i < this.levelProgress.length - 1) {
          this.levelProgress[i + 1].unlocked = true;
          this.levelProgress[i + 1].lessonProgress[0].unlocked = true;
        }
      }
    }
  }

  await this.save();
};

// Method to mark the final exam as completed and update progress
userProgressSchema.methods.completeFinalExam = async function (levelId, score) {

  for (const level of this.levelProgress) {
    console.log(level.level.toString() === levelId)
    if (level.level.toString() == levelId) {
      if (!level.finalExamUnlocked) {
        throw new Error("Final exam is not unlocked yet.");
      }
      level.finalExamScore = score;
      await this.updateProgress();
      return;
    }
  }
  throw new Error("Level not found.");
};

const UserProgress = mongoose.model("UserProgress", userProgressSchema);
module.exports = UserProgress;
