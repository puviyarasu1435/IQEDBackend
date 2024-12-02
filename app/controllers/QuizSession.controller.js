const { TopicModel, QuestionModel, QuizSessionModel, UserModel, SectionModel } = require("../models");
const mongoose = require("mongoose");
async function createQuizSession(req, res) {
  try {
    const { sectionIndex,lessonIndex,topicIndex,topicId, questionCount } = req.body;
    
    // Validate input
    if (!topicId || !questionCount) {
      return res.status(400).json({ message: "Missing required fields: topicId or questionCount." });
    }
    const topic = await TopicModel.findById(topicId);

    if (typeof questionCount !== "number" || questionCount <= 0) {
      return res.status(400).json({ message: "questionCount must be a positive integer." });
    }

    // Fetch random questions
    const questionsList = await QuestionModel.aggregate([
      { $match: { topics: topic._id } }, // Match topic ID
      { $sample: { size: questionCount } }, // Randomly sample questions
    ]);

    if (questionsList.length === 0) {
      return res.status(404).json({ message: "No questions found for this topic." });
    }
    // Create a new quiz session
    const newSession = new QuizSessionModel({
      host: req._id, // Assuming user ID is attached to the request
      questionsList:questionsList,
      careerPath:{
        Section:sectionIndex,
        Lesson:lessonIndex,
        Topic:topicIndex
      },
      questionCount,
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
    const sessionId = req.session.QuizToken;
    if (!sessionId) {
      return res.status(400).json({ message: "Invalid sessionId provided." });
    }

    const session = await QuizSessionModel.findById(sessionId).populate("questionsList").exec();

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
    const sessionId = req.session.QuizToken;
    const { answeredQuestions, timeTaken } = req.body;

    if (!timeTaken || !answeredQuestions || !Array.isArray(answeredQuestions)) {
      return res.status(400).json({ message: "Invalid answers provided." });
    }

    // Fetch session
    const session = await QuizSessionModel.findById(sessionId).populate(
      "questionsList"
    );
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    // Fetch Section List
    const SectionList = await SectionModel.find().populate({
      path: "lesson",
      populate: {
        path: "topics",
      },
    });

    // Fetch user
    const user = await UserModel.findById(session.host);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update answeredQuestions and calculate score
    session.answeredQuestions = answeredQuestions;
    session.score = answeredQuestions.reduce((score, answer) => {
      const question = session.questionsList.find(
        (q) => q._id.toString() === answer.questionId.toString()
      );
      return question && answer.correct ? score + 1 : score;
    }, 0);

    // Update timeTaken
    session.timeTaken = timeTaken;

    // Update status if all questions are answered
    if (answeredQuestions.length >= session.questionCount) {
      session.status = "completed";
    }

    // Progression logic
    const careerPath = user.careerPathProgress;
    const { Section, Lesson, Topic } = session.careerPath;

    const currentSection = SectionList[Section];
    const currentLesson = currentSection.lesson[Lesson];
    const currentTopic = careerPath.sections[Section].lessons[Lesson].topics[Topic];

    const isLastTopic = Topic >= currentLesson.topics.length - 1;
    const isLastLesson = Lesson >= currentSection.lesson.length - 1;
    const isLastSection = Section >= SectionList.length - 1;

    // Mark current topic as completed if not already
    if (!currentTopic.isCompleted) {
      currentTopic.isCompleted = true;
    }

    if (!isLastTopic) {
      const nextTopic = currentLesson.topics[Topic + 1];
      const existingTopic = careerPath.sections[Section].lessons[Lesson].topics.find(
        (t) => t._id.toString() === nextTopic._id.toString()
      );

      // Only push the next topic if it hasn't already been completed
      if (!existingTopic) {
        careerPath.sections[Section].lessons[Lesson].topics.push(nextTopic);
      }
    } else if (!isLastLesson) {
      const nextLesson = currentSection.lesson[Lesson + 1];
      const existingLesson = careerPath.sections[Section].lessons.find(
        (l) => l._id.toString() === nextLesson._id.toString()
      );

      // Only push the next lesson if it hasn't already been added
      if (!existingLesson) {
        careerPath.sections[Section].lessons.push(nextLesson);
      }
    } else if (!isLastSection) {
      const nextSection = SectionList[Section + 1];
      const existingSection = careerPath.sections.find(
        (s) => s._id.toString() === nextSection._id.toString()
      );

      // Only push the next section if it hasn't already been added
      if (!existingSection) {
        careerPath.sections.push(nextSection);
      }
    } else {
      // All sections, lessons, and topics are completed
      session.status = "completed";
    }

    // Save updates
    await user.save();
    await session.save();

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Error updating session answers", error });
  }
}




module.exports = {
  createQuizSession,
  getQuizSession,
  updateQuizSessionAnswers,
};
