const {
  TopicModel,
  QuestionModel,
  QuizSessionModel,
  UserModel,
} = require("../models");
const mongoose = require("mongoose");
const UserProgress = require("../models/User/UserProgress.model");
const Course = require("../models/Career/Course.model");
const { UpdateProgressfunction } = require("../middleware/CareerUpdate");
async function createQuizSession(req, res) {
  try {
    const { levelid, lessonid, topicId, questionCount } = req.body;
      
    // Validate input
    if (!topicId || !questionCount) {
      return res
        .status(400)
        .json({
          message: "Missing required fields: topicId or questionCount.",
        });
    }
    const topic = await TopicModel.findById(topicId);

    if (typeof questionCount !== "number" || questionCount <= 0) {
      return res
        .status(400)
        .json({ message: "questionCount must be a positive integer." });
    }

    // Fetch random questions
    const questionsList = await QuestionModel.aggregate([
      { $match: { topics: topic._id } }, // Match topic ID
      { $sample: { size: questionCount } }, // Randomly sample questions
    ]);

    if (questionsList.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for this topic." });
    }
    // Create a new quiz session
    const newSession = new QuizSessionModel({
      host: req._id, // Assuming user ID is attached to the request
      questionsList: questionsList,
      careerPath: {
        Level: levelid,
        Lesson: lessonid,
        Topic: topicId,
      },
      questionCount,
      Topics: topic.name,
    });

    const savedSession = await newSession.save();

    // Store session ID in the request session (if applicable)
    req.session.QuizToken = savedSession._id;

    return res.status(201).json({
      message: "Session created successfully.",
      sessionId: savedSession._id,
    });
  } catch (error) {
    console.error("Error creating quiz session:", error); // Log error for debugging
    return res.status(500).json({ message: "Error creating session.", error });
  }
}
async function getQuizSession(req, res) {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: "Invalid sessionId provided." });
    }

    const session = await QuizSessionModel.findById(sessionId)
      .populate("questionsList")
      .exec();

    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    return res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Error updating session answers", error });
  }
}
async function updateQuizSessionAnswers(req, res) {
  try {
    const { sessionId, answeredQuestions, timeTaken } = req.body;

    if (!timeTaken || !answeredQuestions || !Array.isArray(answeredQuestions)) {
      return res.status(400).json({ message: "Invalid answers provided." });
    }

    const session = await QuizSessionModel.findById(sessionId).populate(
      "questionsList"
    );
    if (!session)
      return res.status(404).json({ message: "Session not found." });

    const user = await UserModel.findById(session.host);
    if (!user) return res.status(404).json({ message: "User not found." });

    session.answeredQuestions = answeredQuestions;
    session.score = answeredQuestions.reduce((score, answer) => {
      const question = session.questionsList.find(
        (q) => q._id.toString() === answer.questionId.toString()
      );
      return question && answer.correct ? score + 1 : score;
    }, 0);
    session.timeTaken = timeTaken;

    if (answeredQuestions.length >= session.questionCount) {
      session.status = "completed";
    }
    await UpdateProgressfunction({
      userId: session.host,
      careerPathId: "679d3fd96aeede5b160420a6",
      levelId: session.careerPath.Level,
      lessonId: session.careerPath.Lesson,
      topicId: session.careerPath.Topic,
      score: session.score,
      LastSessionTime:session.timeTaken,
      totalquiz:session.questionCount
    });
    await session.save();

    res.status(200).json(session);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error updating session answers",
        error: error.message || error,
      });
  }
}

module.exports = {
  createQuizSession,
  getQuizSession,
  updateQuizSessionAnswers,
};
