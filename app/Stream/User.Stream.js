const { UserModel } = require("../models");
const QuestModel = require("../models/Quest/Quest.model");

const main = async () => {
  try {
    // Start watching changes in the UserModel
    const userChangeStream = UserModel.watch();

    userChangeStream.on("change", async (change) => {
      // Proceed only if the operation is an update
      if (change.operationType === "update") {
        const userId = change.documentKey._id;
        console.log("Update detected for user:", userId);

        // Check if the updated fields are present and include earnings
        if (
          change.updateDescription &&
          change.updateDescription.updatedFields &&
          Object.keys(change.updateDescription.updatedFields).some((field) =>
            field.startsWith("earnings")
          )
        ) {
          const updatedFields = change.updateDescription.updatedFields;
          console.log("Updated fields:", updatedFields);
          const User = await UserModel.findOne({ _id: userId });
          ValueBaseCriteria(User, updatedFields);
          // Handle specific fields within earnings
          // if (updatedFields["earnings.xp"] !== undefined) {
          //   const newXp = updatedFields["earnings.xp"];
          //   console.log(`User ${userId} XP updated to: ${newXp}`);

          //   // Example condition: Check if XP reaches a threshold
          //   if (newXp >= 500) {
          //     console.log(`Achievement unlocked for user: ${userId}`);
          //     // Additional logic for rewards or updates can go here
          //   }
          // }

          // if (updatedFields["earnings.iqGems"] !== undefined) {
          //   const newIqGems = updatedFields["earnings.iqGems"];
          //   console.log(`User ${userId} IQ Gems updated to: ${newIqGems}`);
          // }
        }
      }
    });

    console.log("User change stream is active.");
  } catch (error) {
    console.error("Error starting user change stream:", error.message);
  }
};

module.exports = { main };

// const evaluateCriteria = async (user) => {
//   const now = new Date();

//   user.rewards.forEach(async (reward) => {
//     if (reward.isCompleted) return; // Skip completed rewards

//     const { type, params, rewardCallback } = reward;

//     let conditionMet = false;

//     switch (type) {
//       case "timeBased":
//         // Params: { activeTime: Date, withinDays: Number, expectedValue: Number, field: String }
//         const { activeTime, withinDays, expectedValue, field } = params;
//         const timeLimit = new Date(activeTime);
//         timeLimit.setDate(timeLimit.getDate() + withinDays);

//         if (now <= timeLimit && user[field] >= expectedValue) {
//           conditionMet = true;
//         }
//         break;

//       case "valueBased":
//         // Params: { currentValue: Number, expectedValue: Number, operator: String }
//         const { currentValue, expectedValue: value, operator } = params;

//         switch (operator) {
//           case "==":
//             conditionMet = currentValue === value;
//             break;
//           case ">=":
//             conditionMet = currentValue >= value;
//             break;
//           case "<=":
//             conditionMet = currentValue <= value;
//             break;
//           case ">":
//             conditionMet = currentValue > value;
//             break;
//           case "<":
//             conditionMet = currentValue < value;
//             break;
//         }
//         break;

//       case "taskBased":
//         // Params: { taskId: String }
//         const { taskId } = params;

//         if (user.taskProgress.get(taskId) === true) {
//           conditionMet = true;
//         }
//         break;

//       default:
//         console.error(`Unsupported reward type: ${type}`);
//     }

//     if (conditionMet) {
//       triggerReward(user, rewardCallback);
//       reward.isCompleted = true; // Mark reward as completed
//       await user.save(); // Save updated user data
//     }
//   });
// };

const ValueBaseCriteria = async (user, updatedFields) => {
  const { Quest, progress, isCompleted } = user.valueBaseQuest;
  console.log(Quest);
  if (!isCompleted) {
    const currentQuest = await QuestModel.findById(Quest);
    let { currentValue, targetValue, comparisonOperator } =
      currentQuest.params;
    if(currentValue=="streak"){
      currentValue+="count"
    }
    if (updatedFields["earnings." + currentValue] !== undefined) {
      let CheckComplted = false; //
      
      let CValue = updatedFields["earnings." + currentValue];
      switch (comparisonOperator) {
        case "==":
          CheckComplted = CValue === targetValue;
          break;
        case ">=":
          CheckComplted = CValue >= targetValue;
          break;
        case "<=":
          CheckComplted = CValue <= targetValue;
          break;
        case ">":
          CheckComplted = CValue > targetValue;
          break;
        case "<":
          CheckComplted = CValue < targetValue;
          break;
      }
      if (CValue <= targetValue) {
        user.valueBaseQuest.progress = (CValue / targetValue) * 100;
      } else {
        user.valueBaseQuest.progress = 100;
      }
      console.log(CheckComplted, comparisonOperator, CValue, targetValue);
      if (CheckComplted) {
        user.valueBaseQuest.isCompleted = true;
        switch (currentQuest.reward.type) {
          case "xp":
            user.earnings.xp += currentQuest.reward.value;
            console.log("User rewarded with 100 XP!");
            break;
      
          case "Gems":
            user.earnings.iqGems += currentQuest.reward.value;
            console.log("User rewarded with 50 gems!");
            break;

          default:
            console.error(`Unknown reward callback: ${reward}`);
        }
        user.AchivedQuest.push(currentQuest._id)
        user.valueBaseQuest ={Quest:"674d0bf0a90dacf8663904aa",progress:user.earnings.streak.count,isCompleted:false}
      }
      user.save();
    }
  }
};

const triggerReward = (user, reward) => {

  return user;
};
