const { UserModel } = require("../models");

async function getUser(req, res) {
  try {
    if (!req._id) {
      return res.status(400).send("Request ID is missing.");
    }

    console.log("Request ID:", req._id);

    const user = await UserModel.findOne({ _id: req._id })
    .populate("valueBaseQuest.Quest") // Populate the valueBaseQuest.Quest reference
    .populate("AchivedQuest") // Populate the AchivedQuest array references
    .exec();

    if (!user) {
      return res.status(404).send("User not found.");
    }

    return res.status(200).json({
      message: "User fetched successfully!",
      data: {
        _id: user._id,
        name: user.name,
        email: user.auth.email,
        profileImage: user.profileImage,
        userName: user.userName,
        age: user.age,
        schoolName: user.schoolName,
        grade: user.grade,
        mobilenumber: user.mobileNumber,
        earnings: user.earnings,
        valueBaseQuest: user.valueBaseQuest,
        careerPathProgress: user.careerPathProgress,
        AchivedQuest: user.AchivedQuest
      },
    });
  } catch (error) {
    console.error("Error during getUser execution:", error.message, error.stack);
    return res.status(500).send("An error occurred. Please try again.");
  }
}



async function getEarnings(req, res) {
  try {
    const user = await UserModel.findOne({ _id: req._id });
    if (!user) {
      return res.status(401).send("User not found.");
    }
    return res.status(200).json({
      message: "Earnings get successfully!",
      data: user.earnings,
    });
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).send("An error occurred. Please try again.");
  }
}

async function putXP(req, res) {
  try {
    const { xp } = req.body;
    const user = await UserModel.findOne({ _id: req._id });
    if (!user) {
      return res.status(401).send("User not found.");
    }
    if (xp) {
      user.earnings.xp += xp;
      await user.save();
      return res.status(200).json({
        message: `Add ${xp}xp+ to your earnings`,
        data: user.earnings.xp,
      });
    } else {
      return res.status(401).json({ message: "xp not found" });
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).send("An error occurred. Please try again.");
  }
}

async function putGem(req, res) {
  try {
    const { iqGem } = req.body;
    const user = await UserModel.findOne({ _id: req._id });
    if (!user) {
      return res.status(401).send("User not found.");
    }
    if (iqGem) {
      user.earnings.iqGems += iqGem;
      await user.save();
      return res.status(200).json({
        message: `You Get ${iqGem} IQGEMS!!!`,
        data: user.earnings.iqGems,
      });
    } else {
      return res.status(401).json({ message: "Gem not found" });
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).send("An error occurred. Please try again.");
  }
}

async function getleaderboard(req, res) {
  try {
    const page = 1 
    const limit = 10 
    const users = await UserModel.find()
      .sort({ "earnings.xp": -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("name earnings.xp earnings.rank profileImage");
    const totalUsers = await UserModel.countDocuments();

    return res.status(200).json({
      page: parseInt(page),
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
      users,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).send("Internal server error");
  }
}

async function UpdateUser(req, res) {
  try {
    const { Name, SchoolName, Grade, profileImage } = req.body;
    const user = await UserModel.findById(req._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (Name) user.name = Name;
    if (SchoolName) user.schoolName = SchoolName;
    if (Grade) user.grade = Grade;
    if (profileImage) user.profileImage = profileImage;

    await user.save();
    res.status(200).json({
      message: "User profile updated successfully",
      data: {
        name: user.name,
        email: user.auth.email,
        profile: user.profileImage,
        username: user.username,
        age: user.age,
        schoolname: user.schoolName,
        grade: user.grade,
        mobilenumber: user.mobileNumber,
        earnings: user.earnings,
       
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getUser, getEarnings, putXP, putGem, getleaderboard ,UpdateUser};
