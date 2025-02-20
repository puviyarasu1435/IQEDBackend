const express = require("express");
const mongoose = require("mongoose");
const UserProgress = require("../models/User/UserProgress.model");

async function UpdateProgress(req, res) {
  //   const lessonId = req.params.lessonId;
  //   const userId = req.user._id;
  const { userId, careerPathId, levelId, lessonId, topicId, score } = req.body;

  try {
    let userProgress = await UserProgress.findOne({
      user: userId,
      careerPath: careerPathId,
    })
    if (!userProgress) {
      return res.status(404).json({ message: "User progress not found" });
    }
    const levelProgress = userProgress.levelProgress.find((lp) =>
      lp.level.equals(levelId)
    );
    if (!levelProgress) {
      return res.status(404).json({ message: "Level progress not found" });
    }

    const lessonProgress = levelProgress.lessonProgress.find((lp) =>
      lp.lesson.equals(lessonId)
    );
    if (!lessonProgress) {
      return res.status(404).json({ message: "Topic progress not found" });
    }

    const topicProgress = lessonProgress.topicProgress.find((tp) =>
      tp.topic.equals(topicId)
    );
    if (!topicProgress) {
      return res.status(404).json({ message: "Lesson progress not found" });
    }

    topicProgress.completed = true;
    topicProgress.score = score;

    const allTopicsCompleted = lessonProgress.topicProgress.every(
      (lp) => lp.completed
    );
    if (allTopicsCompleted) {
      lessonProgress.completed = true;

      const allLessonsCompleted = levelProgress.lessonProgress.every(
        (tp) => tp.completed
      );
      if (allLessonsCompleted) {
        levelProgress.completed = true;
      }
    }

    await userProgress.updateProgress();

    res.json({
      message: "Lesson completed and progress updated",
      userProgress,
    });
  } catch (error) {
    console.error("Error completing lesson:", error);
    res.status(500).json({ message: "Server error" });
  }
}
async function UpdateProgressfunction({ userId, careerPathId, levelId, lessonId, topicId, score ,LastSessionTime,totalquiz}) {
    console.log("fn----",userId, careerPathId, levelId, lessonId, topicId, score)
    try {
      let userProgress = await UserProgress.findOne({
        user: userId
      })
      if (!userProgress) {
        console.log({ message: "User progress not found" });
      }
      const levelProgress = userProgress?.levelProgress.find((lp) =>
        lp.level.equals(levelId)
      );
      if (!levelProgress) {
        console.log({ message: "Level progress not found",userProgress });
      }
  
      const lessonProgress = levelProgress.lessonProgress.find((lp) =>
        lp.lesson.equals(lessonId)
      );
      if (!lessonProgress) {
        console.log({ message: "Topic progress not found" });
      }
  
      const topicProgress = lessonProgress.topicProgress.find((tp) =>
        tp.topic.equals(topicId)
      );
      if (!topicProgress) {
        console.log({ message: "Lesson progress not found" });
      }
  
      topicProgress.completed = true;
      if((score/totalquiz)*100 >=80){          
          topicProgress.score = score;
          topicProgress.LastSessionTime=LastSessionTime;
 
      const allTopicsCompleted = lessonProgress.topicProgress.every(
        (lp) => lp.completed
      );
      if (allTopicsCompleted) {
        lessonProgress.completed = true;
  
        const allLessonsCompleted = levelProgress.lessonProgress.every(
          (tp) => tp.completed
        );
        if (allLessonsCompleted) {
          levelProgress.completed = true;
        }
      }
  
      await userProgress.updateProgress();
    }
      console.log({
        message: "Lesson completed and progress updated",
        userProgress,
      });
    } catch (error) {
      console.error("Error completing lesson:", error);
    }
  }
  
module.exports = { UpdateProgress ,UpdateProgressfunction};
