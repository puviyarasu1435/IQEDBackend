const { IQQuestionModel } = require("../models");

async function postQuestions(req, res) {
  try {
    const newQuestion = new IQQuestionModel(req.body);
    const savedQuestion = await newQuestion.save();
    return res.status(200).json({
      message: "Question post successfully!",
      data: savedQuestion,
    });
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).send("An error occurred. Please try again.");
  }
}
async function postBulkQuestions(req, res) {
  try {
    const questions = req.body; // Expecting an array of question objects
    if (!Array.isArray(questions)) {
      return res.status(400).json({ message: "Invalid input. Expected an array of questions." });
    }
    const savedQuestions = await IQQuestionModel.insertMany(questions);
    return res.status(200).json({
      message: "Bulk questions posted successfully!",
      data: savedQuestions,
    });
  } catch (error) {
    console.error("Error during bulk insert:", error);
    return res.status(500).send("An error occurred during bulk insertion. Please try again.");
  }
}
async function putQuestions(req, res) {
  try {
    const updatedQuestion = await IQQuestionModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return updated document & validate input
    );
    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }
    return res.status(200).json({
      message: "Updated successfully!",
      data: updatedQuestion,
    });
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).send("An error occurred. Please try again.");
  }
}

async function deleteQuestions(req, res) {
  try {
    const deletedQuestion = await IQQuestionModel.findByIdAndDelete(
      req.params.id
    );
    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).send("An error occurred. Please try again.");
  }
}

async function getAllQuestions(req, res) {
  try {
    const questions = await IQQuestionModel.find().populate("topics");
    res
      .status(200)
      .json({ message: "Question get successfully", data: questions });
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).send("An error occurred. Please try again.");
  }
}

async function getQuestions(req, res) {
  try {
    const question = await IQQuestionModel.findById(req.params.id).populate(
      "topics"
    );
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res
      .status(200)
      .json({ message: "Question getbyId successfully", data: question });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).send("Internal server error");
  }
}

module.exports = {
  postQuestions,
  putQuestions,
  deleteQuestions,
  postBulkQuestions,
  getAllQuestions,
  getQuestions,
};
