const {
  TopicModel,
  IQQuestionModel,
  IQSessionModel,
  IQModel,
} = require("../models");
const mongoose = require("mongoose");
const MailTransporter = require("../config/mailer.config");
const {htmltemplte,htmltemplteno} = require("../models/IQ/template");


async function createIQSession(req, res) {
  try {
    const { questionCount } = req.body;

    const TopicDistribution = {
      "Logical Reasoning": 9,
      "Verbal Comprehension": 9,
      "Working Memory": 8,
      "Spatial Reasoning": 9,
    };

    const quizQuestions = [];

    for (const [TopicName, count] of Object.entries(TopicDistribution)) {
      if (count === 0) continue;

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
    console.error("Error creating quiz session:", error);
    return res.status(500).json({ message: "Error creating session.", error });
  }
}

async function getIQSession(req, res) {
  try {
    const {sessionId} = req.body;
    if (!sessionId) {
      return res.status(400).json(req.body);
    }

    const session = await IQSessionModel.findById(sessionId)
      .populate("questionsList")
      .exec();

    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }
    console.log(session);
    return res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Error updating session answers", error });
  }
}

const calculateIQ = async (userScore) => {
  const iqScores = await IQModel.findById({ _id: "6752dd617d7a64aaf797a1ec" });
  console.log(iqScores);
  const updatedScores = [...iqScores.Scores, userScore];

  const mean =
    updatedScores.reduce((sum, score) => sum + score, 0) / updatedScores.length;
  const standardDeviation = Math.sqrt(
    updatedScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      (updatedScores.length - 1)
  );

  const zScore = (userScore - mean) / standardDeviation;
  const calculatedIQ = zScore * 15 + 100;

  if (calculatedIQ > 55) {
    iqScores.Scores.push(userScore);
    iqScores.save();
  }

  return calculatedIQ.toFixed(2);
};

async function updateIQSessionAnswers(req, res) {
  try {
   
    const { answeredQuestions, timeTaken, sessionId } = req.body;

    if (!sessionId || !timeTaken || !Array.isArray(answeredQuestions)) {
      return res.status(400).json({ message: "Invalid request payload." });
    }

    const session = await IQSessionModel.findById(sessionId).populate(
      "questionsList"
    );
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    session.answeredQuestions = answeredQuestions;
    const score = answeredQuestions.reduce((score, answer) => {
      const question = session.questionsList.find(
        (q) => q._id.toString() === answer.questionId.toString()
      );
      return question && answer.correct ? score + 1 : score;
    }, 0);

    session.timeTaken = timeTaken;
    session.status = "completed";
    session.score = score;
    const IQsocre = await calculateIQ(score);
    if (IQsocre != NaN) {
      session.IQscore = IQsocre;
    }
    console.log(IQsocre, score);

    await session.save();

    return res.status(200).json(session);
  } catch (error) {
    console.error("Error updating session answers:", error);
    return res
      .status(500)
      .json({ message: "Error updating session answers.", error });
  }
}

////////////////////////////////
async function Send_Email_PDF(toEmail, file, name, score) {
  const imagedata = file.replace(/^data:image\/png;base64,/, "");
  try {
    const att = [
        {
          filename: "red-dot.png", // Inline image
          content: Buffer.from(imagedata, "base64"),
          contentType: "image/png",
          cid: "chartimage", // Content ID for referencing in the email
        },
      ]
    const mailOptions = {
      from: process.env.Mail_User, // Sender's email
      to: toEmail, // Recipient's email
      subject: "IQED | IQ TEST RESULT",
      html:score>55? htmltemplte({ name, score }) : htmltemplteno({name, score }),
      attachments:score>55 ? att:[] ,
    };

    await MailTransporter.sendMail(mailOptions);
    console.log("Email sent successfully to:",toEmail,  name, score);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}


async function SendMail(req, res)  {
  try {

    const { file, email, name ,sessionId} = req.body;
    const session = await IQSessionModel.findById(sessionId);
    console.log(file, email, name, session);
    const emailSent = await Send_Email_PDF(email, file, name, session.IQscore);
    if (emailSent) {
      return res.status(200).send("File uploaded and email sent successfully!");
    } else {
      return res.status(500).send("An error occurred while sending the email.");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred.");
  }
}












module.exports = {
  createIQSession,
  SendMail,
  getIQSession,
  updateIQSessionAnswers,
};
