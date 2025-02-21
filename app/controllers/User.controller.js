const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const S3 = require("../config/aws.config");
const { UserModel } = require("../models");
const UserProgress = require("../models/User/UserProgress.model");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

async function uploadImagesToS3(file) {
  if (!file || !file.buffer || !file.originalname || !file.mimetype) {
    throw new Error("Invalid file object. Ensure file is correctly uploaded.");
  }
  const fileKey = `${Date.now()}-${file.originalname}`;
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await S3.send(new PutObjectCommand(params));

  return fileKey;
}

async function getUser(req, res) {
  try {
    if (!req._id) {
      return res.status(400).send("Request ID is missing.");
    }

    console.log("Request ID:", req._id);

    const user = await UserModel.findOne({ _id: req._id })


    const userProgress = await UserProgress.findById(user.CourseProgress)
      .populate({
        path: "careerPath",
        select: "name description",
      })
      .populate({
        path: "levelProgress.level",
      })
      .populate({
        path: "levelProgress.lessonProgress.lesson",
      })
      .populate({
        path: "levelProgress.lessonProgress.topicProgress.topic",
      });
    if (!user) {
      return res.status(404).send("User not found.");
    }
    const profileUrl = user.profileImage ? await generateSignedUrl(user.profileImage) : null;
    return res.status(200).json({
      message: "User fetched successfully!",
      data: {
        _id: user._id,
        name: user.name,
        email: user.auth.email,
        profileImage: profileUrl,
        userName: user.userName,
        age: user.age,
        schoolName: user.schoolName,
        grade: user.grade,
        mobilenumber: user.mobileNumber,
        earnings: user.earnings,
        XPQuests: user.XPQuests,
        CourseProgress: userProgress,
        StreakQuest: user.StreakQuest,
      },
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
    const page = 1;
    const limit = 10;
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
async function generateSignedUrl(imageKey) {
  return await getSignedUrl(
    S3,
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imageKey,
    }),
    { expiresIn: 60*60*24 } // URL expires in 1 hour
  );
}
async function UpdateUser(req, res) {
  try {
    const { Name, schoolName, grade } = req.body;
    const userId = req.user?.id || req.params.id || req._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Received Files:", req.file);
    console.log("Received Body:", req.body);

    if (Name) user.name = Name;
    if (schoolName) user.schoolName = schoolName;
    if (grade) user.grade = grade;

    if (req.file) {
      let profileImageFile = Array.isArray(req.file)
        ? req.file[0]
        : req.file;
      let profileImage = await uploadImagesToS3(profileImageFile);
      if (profileImage) {
        user.profileImage = profileImage;
        console.log("Uploaded Profile Image:", profileImage);
      }
    }

    await user.save();

    const profileUrl = user.profileImage ? await generateSignedUrl(user.profileImage) : null;

    res.status(200).json({
      message: "User profile updated successfully",
      data: {
        name: user.name,
        email: user.auth.email,
        profile: profileUrl,
        username: user.userName,
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



async function UnlockedTopics(req, res) {
try {
  const userId = req.user?.id || req.params.id || req._id;
  
  const userProgress = await UserProgress.findOne({ user: userId }).populate({
    path: "levelProgress.lessonProgress.topicProgress.topic",
    select: "name", // Only fetching necessary fields
  });

  if (!userProgress) {
    return res.status(404).json({ message: "User progress not found" });
  }

  const uniqueTopics = new Map();

  userProgress.levelProgress.forEach(level => {
    level.lessonProgress.forEach(lesson => {
      lesson.topicProgress.forEach(topic => {
        if (topic.unlocked && !uniqueTopics.has(topic.topic._id.toString())) {
          uniqueTopics.set(topic.topic._id.toString(), {
            id: topic.topic._id,
            name: topic.topic.name,
          });
        }
      });
    });
  });

  return res.json({ unlockedTopics: Array.from(uniqueTopics.values()) });

} catch (error) {
  console.error("Error fetching unlocked topics:", error);
  return res.status(500).json({ message: "Internal server error" });
}
}



module.exports = {
  getUser,
  getEarnings,
  putXP,
  putGem,
  getleaderboard,
  UpdateUser,
  UnlockedTopics
};
