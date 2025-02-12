const express = require("express");

const UserModel = require("../models/User/User.model"); // Assuming User model is in models/User.js



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

// Get all users without auth.password
async function getAllUsers(req, res) {
  try {
    const users = await UserModel.find({}, { "auth.password": 0 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Delete multiple users by _id
async function deleteUsers(req, res) {
  try {
    const { userIds } = req.body; // Expecting an array of user _id's
    console.log("Id",userIds)
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "Invalid user IDs" });
    }

    const result = await UserModel.deleteMany({ _id: { $in: userIds } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No users found to delete" });
    }

    res.json({ message: "Users deleted successfully", deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


module.exports = {getActiveUsersLast30Days,getTotalUsers,getUsersCreatedThisWeek,getUsersCreatedLastWeek,getAllUsers,deleteUsers};
