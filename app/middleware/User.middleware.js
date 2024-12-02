const { UserModel } = require("../models");

async function CheckEarnings(req, res, next) {
  const user = await UserModel.findOne({ _id: req._id });
  const UsersList = await UserModel.find()
    .sort({ "earnings.xp": -1 })
    .select("_id earnings.xp");
  if (!user) {
    return res.status(401).send("User not found.");
  }
  const position = UsersList.findIndex((u) => u._id == req._id);
  const today = new Date();
  const lastUpdateDate = user.earnings.streak.lastUpdate.toDateString();
  if (lastUpdateDate == null || lastUpdateDate != today.toDateString()) {
    user.earnings.streak.count += 1;
    user.earnings.streak.lastUpdate = today;
  }
  if(position!=null || position>-1){
      user.earnings.rank = position+1;
  }
  await user.save();
  next();
}

module.exports = { CheckEarnings };
