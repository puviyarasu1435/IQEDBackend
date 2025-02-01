const express = require("express");
const mongoose = require("mongoose");
const { CareerPath, Lesson, Level } = require("../models/Test/careerpath");

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
async function GetCareerpathById(req, res) {
  try {
    const careerPath = await CareerPath.findById(req.params.id)
    .populate({
      path: "levels",
      populate: {
        path: "lessons",
        model: "Lesson1", // Explicitly specifying the model
        populate: {
          path: "topics",
          model: "Topics", // Ensure this matches the correct model name
        },
      },
    });
  

    // if (!careerPath)
    //   return res.status(404).json({ message: "Course not found" });

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: "Error fetching course", error });
  }
}
module.exports = { bulkCareerPaths, GetCareerpathById };
