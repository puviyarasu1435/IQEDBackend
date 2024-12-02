const { LessonModel } = require("../models");


async function postLesson(req, res) {
  try {
    const lesson = new LessonModel(req.body);
    const savedLesson = await lesson.save();
    res.status(200).json({ message: "Lesson created successfully", data: savedLesson });
  } catch (error) {
    console.error("Error creating lesson:", error);
    res.status(500).send("An error occurred. Please try again.");
  }
}

async function getAllLessons(req, res) {
  try {
    const lessons = await LessonModel.find().populate("topics");
    res.status(200).json({ message: "Lessons fetched successfully", data: lessons });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).send("An error occurred. Please try again.");
  }
}

async function getLessonById(req, res) {
  try {
    const lesson = await LessonModel.findById(req.params.id).populate("topics");
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.status(200).json({ message: "Lesson fetched successfully", data: lesson });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    res.status(500).send("An error occurred. Please try again.");
  }
}

async function updateLesson(req, res) {
  try {
    const updatedLesson = await LessonModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedLesson) return res.status(404).json({ message: "Lesson not found" });
    res.status(200).json({ message: "Lesson updated successfully", data: updatedLesson });
  } catch (error) {
    console.error("Error updating lesson:", error);
    res.status(500).send("An error occurred. Please try again.");
  }
}

async function deleteLesson(req, res) {
  try {
    const deletedLesson = await LessonModel.findByIdAndDelete(req.params.id);
    if (!deletedLesson) return res.status(404).json({ message: "Lesson not found" });
    res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    res.status(500).send("An error occurred. Please try again.");
  }
}




module.exports = {
  postLesson,
  getAllLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
  
};
