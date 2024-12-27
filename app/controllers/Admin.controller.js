const { UserModel } = require("../models");
const moment = require("moment"); // Use moment.js or plain JavaScript for date calculation.

async function getUser(req, res) {
  try {
    const startOfWeek = moment().startOf("week").toDate(); // Sunday at 00:00:00
    const endOfWeek = moment().endOf("week").toDate();
    const user = await UserModel.find();
    const totalUsers = await UserModel.countDocuments();
    const TotalUserRegister = await UserModel.find({
      createdAt: {
        $gte: startOfWeek,
        $lte: endOfWeek,
      },
    });
    const TotalUserLogin = await UserModel.find({
      updatedAt: {
        $gte: startOfWeek,
        $lte: endOfWeek,
      },
    });
    const ThisWeekLogin =
      totalUsers === 0 || TotalUserLogin.length === 0
        ? 0
        : ((TotalUserLogin.length / totalUsers) * 100).toFixed(0);

    const ThisWeekRegister =
      totalUsers === 0 || TotalUserRegister.length === 0
        ? 0
        : ((TotalUserRegister.length / totalUsers) * 100).toFixed(0);

    if (!user) {
      return res.status(404).send("User not found.");
    }

    return res.status(200).json({
      UserCount: totalUsers,
      WeekRegisterCount: ThisWeekRegister,
      WeekLogin: ThisWeekLogin,
      UserList: user,
    });
  } catch (error) {
    console.error(
      "Error during getUser execution:",
      error.message,
      error.stack
    );
    return res.status(500).send("An error occurred. Please try again.");
  }
}

module.exports = { getUser };
