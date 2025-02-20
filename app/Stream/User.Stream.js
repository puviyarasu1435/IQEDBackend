const mongoose = require("mongoose");
const UserModel = require("../models/User/User.model"); // Ensure correct path

const handleStreakUpdate = async (userId, newStreak) => {
  console.log(`Streak updated for user ${userId}:`, newStreak);
  const User = await UserModel.findById(userId);
  if (newStreak!=0) {
    User.StreakQuest.CurrentValue += 1;
    if (User.StreakQuest.CurrentValue >= User.StreakQuest.targetValue) {
      User.earnings.iqGems += User.StreakQuest.rewardGem;
      User.StreakQuest.targetValue += User.StreakQuest.StepUpValue;
      User.StreakQuest.rewardGem += 10;
      User.StreakQuest.CurrentValue = 0;
    }
  } else {
    User.StreakQuest.CurrentValue = 0;
  }
  User.save();
};

const handleXPUpdate = async (userId, newXP) => {
  console.log(`XP updated for user ${userId}:`, newXP);
  const User = await UserModel.findById(userId);
  if (newXP - User.XPQuests.CurrentValue >= User.XPQuests.targetValue) {
    User.earnings.iqGems += User.XPQuests.rewardGem;
    User.XPQuests.targetValue += User.XPQuests.StepUpValue;
    User.StreakQuest.rewardGem += 10;
    User.XPQuests.CurrentValue = newXP;
    User.save();
  }
};

const userChangeStream = UserModel.watch();

userChangeStream.on("change", (change) => {
  if (change.operationType === "update") {
    const updatedFields = change.updateDescription.updatedFields;

    const userId = change.documentKey._id;

    if (
      (updatedFields["earnings.streak.count"] ||
        updatedFields["earnings.streak.lastUpdate"]) &&
      updatedFields["earnings.streak.count"] != undefined
    ) {
      handleStreakUpdate(userId, updatedFields["earnings.streak.count"]);
    }

    if (
      updatedFields["earnings.xp"] &&
      updatedFields["earnings.xp"] != undefined
    ) {
      handleXPUpdate(userId, updatedFields["earnings.xp"]);
    }
  }
});

console.log("Listening for user streak and XP updates...");
