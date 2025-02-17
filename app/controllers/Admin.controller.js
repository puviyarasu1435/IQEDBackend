const express = require("express");

const UserModel = require("../models/User/User.model"); // Assuming User model is in models/User.js
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const S3 = require("../config/aws.config");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const FeedbackModel = require("../models/User/Feedback.model");
const { Lesson, Level } = require("../models/Test/careerpath");
const { TopicModel } = require("../models");
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
// Get last 30 days active user count
async function getActiveUsersLast30Days(req, res) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 7);

    const activeUsers = await UserModel.countDocuments({
      updatedAt: { $gte: thirtyDaysAgo },
    });

    res.json({ activeUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get total user count
async function getTotalUsers(req, res) {
  try {
    const totalUsers = await UserModel.countDocuments();
    res.json({ totalUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Helper function to get user count for the last 7 days
const getUserCountForLast7Days = async (startDate) => {
  const counts = [];
  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(startDate);
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const count = await UserModel.countDocuments({
      createdAt: { $gte: dayStart, $lt: dayEnd },
    });
    counts.unshift(count); // Adds the count in reverse order
  }
  return counts;
};

// Get this week's user created count (last 7 days)
async function getUsersCreatedThisWeek(req, res) {
  try {
    const today = new Date();
    const last7DaysCounts = await getUserCountForLast7Days(today);
    res.json({ last7DaysCounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get last week's user created count (previous 7 days)
async function getUsersCreatedLastWeek(req, res) {
  try {
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekCounts = await getUserCountForLast7Days(lastWeekStart);
    res.json({ lastWeekCounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function generateSignedUrl(imageKey) {
  return await getSignedUrl(
    S3,
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imageKey,
    }),
    { expiresIn: 60 * 60 * 24 } // URL expires in 1 hour
  );
}
// Get all users without auth.password
async function getAllUsers(req, res) {
  try {
    const users = await UserModel.find({}, { "auth.password": 0 });

    const usersWithProfileUrl = await Promise.all(
      users.map(async (user) => {
        const profileUrl = user.profileImage
          ? await generateSignedUrl(user.profileImage)
          : null;

        return {
          ...user.toObject(),
          profileImage: profileUrl,
        };
      })
    );

    res.json({ users: usersWithProfileUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Delete multiple users by _id
async function deleteUsers(req, res) {
  try {
    const { userIds } = req.body; // Expecting an array of user _id's
    console.log("Id", userIds);
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "Invalid user IDs" });
    }

    const result = await UserModel.deleteMany({ _id: { $in: userIds } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No users found to delete" });
    }

    res.json({
      message: "Users deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function UpdateUser(req, res) {
  try {
    const {
      userId,
      name,
      userName,
      email,
      age,
      mobileNumber,
      parentsName,
      schoolName,
      grade,
    } = req.body;
    console.log("Received Files:", req.file);
    console.log("Received Body:", req.body);
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await UserModel.findById(userId);
    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (userName) user.schoolName = userName;
    if (email) user.auth.email = email;
    if (age) user.age = age;
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (parentsName) user.parentsName = parentsName;
    if (schoolName) user.schoolName = schoolName;
    if (grade) user.grade = grade;

    if (req.file) {
      let profileImageFile = Array.isArray(req.file) ? req.file[0] : req.file;
      let profileImage = await uploadImagesToS3(profileImageFile);
      if (profileImage) {
        user.profileImage = profileImage;
        console.log("Uploaded Profile Image:", profileImage);
      }
    }

    await user.save();

    const profileUrl = user.profileImage
      ? await generateSignedUrl(user.profileImage)
      : null;

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

async function deleteFeedback(req, res) {
  try {
    const { feedIds } = req.body; // Expecting an array of user _id's
    console.log("Id", feedIds);
    if (!Array.isArray(feedIds) || feedIds.length === 0) {
      return res.status(400).json({ error: "Invalid user IDs" });
    }

    const result = await FeedbackModel.deleteMany({ _id: { $in: feedIds } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No users found to delete" });
    }

    res.json({
      message: "Users deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getTopicsByLevelId(req, res) {
  try {

    const lessons = await Lesson.find({
      _id: { $in: (await Level.findById(req.body.levelId)).lessons },
    }).populate("topics");


    const topics = lessons.flatMap((lesson) => lesson.topics);
    res.json({
      message: "successfully",
      topics: topics,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


async function deleteTopicsByLevelId(req, res) {
try {
  const { levelId } = req.body;

  // Step 1: Find the Level
  const level = await Level.findById(levelId);
  if (!level) {
    return res.status(404).json({ message: "Level not found." });
  }

  // Step 2: Find all Lessons associated with the Level
  const lessons = await Lesson.find({ _id: { $in: level.lessons } });

  // Step 3: Extract all Topic IDs from the Lessons
  const topicIds = lessons.flatMap((lesson) => lesson.topics);

  // // Step 4: Delete Topics
  // if (topicIds.length > 0) {
  //   await TopicModel.deleteMany({ _id: { $in: topicIds } });
  // }

  
  // Step 5: Delete Lessons
  if (lessons.length > 0) {
    await Lesson.deleteMany({ _id: { $in: level.lessons } });
  }

  // Step 6: Delete the Level
  await Level.findByIdAndDelete(levelId);

  res.json({
    message: "Level, Lessons, and Topics deleted successfully",
    deletedTopics: topicIds,
    deletedLessons: level.lessons,
    deletedLevel: levelId,
  });
} catch (error) {
  console.error("Error deleting Level, Lessons, and Topics:", error);
  res.status(500).json({ message: "Internal Server Error" });
}
}



module.exports = {
  getActiveUsersLast30Days,
  getTotalUsers,
  getUsersCreatedThisWeek,
  getUsersCreatedLastWeek,
  getAllUsers,
  deleteUsers,
  UpdateUser,
  deleteFeedback,
  getTopicsByLevelId,
  deleteTopicsByLevelId
};
