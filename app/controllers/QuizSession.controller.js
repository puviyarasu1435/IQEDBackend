const {
  TopicModel,
  QuestionModel,
  QuizSessionModel,
  UserModel,
  IQSessionModel,
} = require("../models");
const mongoose = require("mongoose");
const UserProgress = require("../models/User/UserProgress.model");
const Course = require("../models/Career/Course.model");
const { UpdateProgressfunction } = require("../middleware/CareerUpdate");
const ChallengeModel = require("../models/Test/Challenge.model");
const { Level } = require("../models/Test/careerpath");

async function createQuizSession(req, res) {
  try {
    const {
      levelid,
      lessonid,
      topicId,
      questionCount,
      Type = "Quiz",
      ChallengeId = null,
      TopicDistribution = [],
    } = req.body;
    console.log(req.body);
    // Validate input
    if (!TopicDistribution && (!topicId || !questionCount)) {
      return res.status(400).json({
        message: "Missing required fields: topicId or questionCount.",
      });
    }
    const topic = await TopicModel.findById(topicId);

    if (typeof questionCount !== "number" || questionCount <= 0) {
      return res
        .status(400)
        .json({ message: "questionCount must be a positive integer." });
    }
    let questionsList = [];

    if (Type == "LevelTest") {
      const level = await Level.findById(levelid).populate({
        path: "lessons",
        populate: { path: "topics" },
      });

      if (!level) {
        return res
          .status(404)
          .json({ success: false, message: "Level not found." });
      }

      const TopicDistribution = level.lessons.flatMap((lesson) =>
        lesson.topics.map((topic) => topic._id)
      );

      if (!Array.isArray(TopicDistribution) || TopicDistribution.length === 0) {
        return res.status(400).json({ error: "No topics provided" });
      }

      questionsList = await QuestionModel.aggregate([
        { $match: { topics: { $in: TopicDistribution } } },
        { $sample: { size: questionCount } },
      ]);
    } else {
      questionsList = await QuestionModel.aggregate([
        { $match: { topics: topic._id } },
        { $sample: { size: questionCount } },
      ]);
    }
    // Fetch random questions

    if (questionsList.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for this topic." });
    }
    if (questionsList.length < questionCount) {
      return res.status(400).json({
        error: "Not enough questions available for the selected topics",
      });
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
      type: Type,
      OneMinuteEqual:Type == "LevelTest" ? 0.8333333 : topic?.OneMinuteEqual,
      Topics: Type == "LevelTest" ? "Final Test" : topic?.name,
    });

    if (Type == "Challenge") {
      newSession.Challenge = ChallengeId;
      newSession.careerPath.Topic = topicId;
    } else if (Type == "Quiz") {
      newSession.careerPath.Level = levelid;
      newSession.careerPath.Lesson = lessonid;
      newSession.careerPath.Topic = topicId;
    } else if (Type == "LevelTest") {
      newSession.careerPath.Level = levelid;
    }
    const savedSession = await newSession.save();

    // Store session ID in the request session (if applicable)

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
      .populate("Challenge")
      .exec();

    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    return res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Error updating session answers", error });
  }
}

async function GetQuizSessionCount(req, res) {
  try {
    const totalSessions = await QuizSessionModel.countDocuments();
    const completedSessions = await QuizSessionModel.countDocuments({
      status: "completed",
    });

    res.json({
      totalSessions,
      completedSessions,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}
async function GetIQSessionCount(req, res) {
  try {
    const totalSessions = await IQSessionModel.countDocuments();
    const completedSessions = await IQSessionModel.countDocuments({
      status: "completed",
    });

    res.json({
      totalSessions,
      completedSessions,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
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
    if (session.type == "Quiz") {
      await UpdateProgressfunction({
        userId: session.host,
        careerPathId: "679d3fd96aeede5b160420a6",
        levelId: session.careerPath.Level,
        lessonId: session.careerPath.Lesson,
        topicId: session.careerPath.Topic,
        score: session.score,
        LastSessionTime: session.timeTaken,
        totalquiz: session.questionCount,
      });
    } else if (session.type == "Challenge" && session.Challenge) {
      if ((session.score / session.questionCount) * 100 > 80) {
        const Challenge = await ChallengeModel.findById(session.Challenge);
        Challenge.participantsCount -= 1;
        if (Challenge.participantsCount <= 0) {
          Challenge.Active = false;
        }
        Challenge.Winners.push(user._id);
        user.earnings.iqGems -= Challenge.eligibleGem;
        Challenge.save();
        user.save();
      }
    } else if (session.type == "LevelTest") {
      if ((session.score / session.questionCount) * 100 > 80) {
        let userProgress = await UserProgress.findOne({
          user: session.host,
        });
        console.log("l",session.careerPath.Level);
        await userProgress.completeFinalExam(session.careerPath.Level,session.score);
      }
    }
    await session.save();

    return res.status(200).json(session);
  } catch (error) {
    res.status(500).json({
      message: "Error updating session answers",
      error: error.message || error,
    });
  }
}

module.exports = {
  createQuizSession,
  getQuizSession,
  updateQuizSessionAnswers,
  GetQuizSessionCount,
  GetIQSessionCount,
};
