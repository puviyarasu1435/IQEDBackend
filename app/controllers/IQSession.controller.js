const { TopicModel, IQQuestionModel, IQSessionModel } = require("../models");
const mongoose = require("mongoose");

async function createIQSession(req, res) {
  try {
    const { questionCount = 35 } = req.body;

    // Category distribution and counts
    const TopicDistribution = {
      "Logical Reasoning": 9, // 9 questions (40%)
      "Verbal Comprehension": 9, // 9 questions (30%)
      "Working Memory": 8, // 8 questions (20%)
      "Spatial Reasoning": 9, // 9 questions (10%)
    };

    const quizQuestions = [];

    for (const [TopicName, count] of Object.entries(TopicDistribution)) {
      const Topic = await TopicModel.findOne({ name: TopicName });

      if (!Topic) {
        return res
          .status(404)
          .json({ error: `Category ${TopicName} not found` });
      }

      const questions = await IQQuestionModel.aggregate([
        { $match: { topics: Topic._id } },
        { $sample: { size: count } },
      ]);

      if (questions.length < count) {
        return res.status(400).json({
          error: `Not enough questions available for category ${TopicName}`,
        });
      }
      quizQuestions.push(...questions);
    }

    if (quizQuestions.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for this topic." });
    }
    // Create a new quiz session
    const newSession = new IQSessionModel({
      questionsList: quizQuestions,
      questionCount,
    });

    const savedSession = await newSession.save();

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
async function getIQSession(req, res) {
  try {
    const sessionId = req.session.QuizToken;
    if (!sessionId) {
      return res.status(400).json({ message: "Invalid sessionId provided." });
    }

    const session = await IQSessionModel.findById(sessionId)
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
async function updateIQSessionAnswers(req, res) {
  try {
    const sessionId = req.session.QuizToken;
    const { answeredQuestions, timeTaken } = req.body;

    if (!timeTaken || !answeredQuestions || !Array.isArray(answeredQuestions)) {
      return res.status(400).json({ message: "Invalid answers provided." });
    }

    // Fetch session
    const session = await IQSessionModel.findById(sessionId).populate(
      "questionsList"
    );
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    // Update answeredQuestions and calculate score
    session.answeredQuestions = answeredQuestions;
    session.score = answeredQuestions.reduce((score, answer) => {
      const question = session.questionsList.find(
        (q) => q._id.toString() === answer.questionId.toString()
      );
      return question && answer.correct ? score + 1 : score;
    }, 0);


    session.timeTaken = timeTaken;
    session.status = "completed";

    await session.save();

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Error updating session answers", error });
  }
}

module.exports = {
  createIQSession,
  getIQSession,
  updateIQSessionAnswers,
};
