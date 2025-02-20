const { jwt_GetToken } = require("../config/jwt.config");
const { TopicModel } = require("../models");
const { Lesson } = require("../models/Test/careerpath");

const router = require("express").Router();

router.get("/", (req, res) => {
  res.send("Server is Online V2");
});
router.get("/test", async (req, res) => {
  try {
    const lessonIds =["679d3fd96aeede5b160420aa","67b2780c2427af539f54e526","67b2a188a9416dc93d6a280e","67b27bd12427af539f54e546","67b2a50ba9416dc93d6a2829","679d3fda6aeede5b160420c0"]

    const lessons = await Lesson.find({ _id: { $in: lessonIds } }).select("topics");

    const topicIds = lessons.flatMap(lesson => lesson.topics);

    if (topicIds.length === 0) {
      console.log("No topics found in the given lessons.");
      return;
    }

    // Update topics by setting OneMinuteEqual = 2
    const result = await TopicModel.updateMany(
      { _id: { $in: topicIds } }, 
      { $set: { OneMinuteEqual: 0.15 } }
    );

    res.send("Updated");
  } catch (error) {
    console.error("Error updating topics:", error);
  }
});
router.get("/test1", (req, res) => {
  res.send("d");
});

module.exports = router;
