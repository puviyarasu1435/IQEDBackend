const express = require("express");
const mongoose = require("mongoose");
const { CareerPath, Lesson, Level } = require("../models/Test/careerpath");
const UserProgress = require("../models/User/UserProgress.model");

async function bulkCareerPaths(req, res) {
  try {
    const careerPaths = req.body;
    for (const careerPath of careerPaths) {
      let newCareerPath = new CareerPath({
        name: careerPath.name,
        description: careerPath.description,
      });
      let levelindex = 0;
      for (const level of careerPath.levels) {
        let newLevel = new Level({
          name: level.name,
          description: level.description,
          levelNumber: levelindex,
        });
        let lessonindex = 0;
        for (const lesson of level.lessons) {
          let newLesson = new Lesson({
            name: lesson.name,
            description: lesson.description,
            topics: lesson.topics.map(
              (topic) => new mongoose.Types.ObjectId(topic.$oid)
            ),
            lessonNumber: lessonindex,
          });
          await newLesson.save();
          newLevel.lessons.push(newLesson._id);
          lessonindex += 1;
        }
        await newLevel.save();
        newCareerPath.levels.push(newLevel._id);
        levelindex += 1;
      }
      await newCareerPath.save();
    }

    res
      .status(201)
      .json({ message: "Bulk Career Paths inserted successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error in bulk career path insertion", error });
  }
}
// async function GetCareerpathById(req, res) {
//   try {
//     const careerPath = await CareerPath.findById(req.params.id)
//       .populate("levels","_id lessons")
//     if (!careerPath)
//       return res.status(404).json({ message: "Course not found" });

//     res.status(200).json(careerPath);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching course", error });
//   }
// }

async function GetCareerpathById(req, res) {
    try {
       // Assuming the user ID is in request params
      if (!req._id) {
        return res.status(400).send("Request ID is missing.");
      }
      const userProgress = await UserProgress.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(req._id) } },
        { $unwind: "$levelProgress" },
        { $unwind: "$levelProgress.lessonProgress" },
        { $unwind: "$levelProgress.lessonProgress.topicProgress" },
        { $match: { "levelProgress.lessonProgress.topicProgress.completed": true } },
  
        // Lookup to populate 'topic'
        {
          $lookup: {
            from: "topics", // Collection name in MongoDB (check your actual name)
            localField: "levelProgress.lessonProgress.topicProgress.topic",
            foreignField: "_id",
            as: "topicDetails",
          },
        },
  
        // Flatten the topicDetails array
        { $unwind: "$topicDetails" },
  
        // Project the final output
        {
          $project: {
            _id: 0,
            topic: "$topicDetails", // Full topic document
            score: "$levelProgress.lessonProgress.topicProgress.score",
            lastSessionTime: "$levelProgress.lessonProgress.topicProgress.LastSessionTime",
          },
        },
      ]);
  
      res.status(200).json(userProgress);
    } catch (error) {
      res.status(500).json({ message: "Error fetching completed topics", error });
    }
  }
  


  async function GetCareerPathAdmin(req, res) {
    try {
      const careerPaths = await CareerPath.findOne({_id:"679d3fd96aeede5b160420a6"})
        .populate({
          path: "levels",
          populate: {
            path: "lessons",
            populate: {
              path: "topics",
            },
          },
        })
        .lean();

  
      res.status(200).json(careerPaths);
    } catch (error) {
      console.error("Error fetching career paths:", error);
      res.status(500).json({ message: "Error fetching career paths", error });
    }
  };
  












module.exports = { bulkCareerPaths, GetCareerpathById,GetCareerPathAdmin };
