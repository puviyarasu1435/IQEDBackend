const { UserModel } = require("../models");

function getDayDifference(date1, date2) {
  const oneDay = 1000 * 60 * 60 * 24; // Milliseconds in a day
  const diffTime = Math.abs(date2.getTime() - date1.getTime()); // Absolute difference
  return Math.floor(diffTime / oneDay); // Convert to full days
}

async function CheckEarnings(req, res, next) {
  const user = await UserModel.findOne({ _id: req._id });
  const UsersList = await UserModel.find()
    .sort({ "earnings.xp": -1 })
    .select("_id earnings.xp");
  if (!user) {
    return res.status(401).send("User not found.");
  }
  const position = UsersList.findIndex((u) => u._id == req._id);
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
  const istNow = new Date(now.getTime() + istOffset); // Convert to IST

  const lastUpdate = new Date(user.earnings.streak.lastUpdate);

  const dayDifference = getDayDifference(istNow, lastUpdate); // Difference in calendar days (IST)
  // console.log(istNow, lastUpdate, dayDifference);
  if (dayDifference === 1) {
    // Logged in on the next IST calendar day → Increase streak
    user.earnings.streak.count += 1;
  } else if (dayDifference > 1) {
    // Missed at least one full IST calendar day → Reset streak
    user.earnings.streak.count = 0;
  }

  // Update last update timestamp (store in UTC for consistency)
  user.earnings.streak.lastUpdate = istNow.toISOString();

  if (position != null || position > -1) {
    user.earnings.rank = position + 1;
  }
  await user.save();
  next();
}

module.exports = { CheckEarnings };
