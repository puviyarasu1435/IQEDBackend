const {
  TopicModel,
  IQQuestionModel,
  IQSessionModel,
  IQModel,
} = require("../models");
const mongoose = require("mongoose");
const MailTransporter = require("../config/mailer.config");
const { htmltemplte, htmltemplteno } = require("../models/IQ/template");
// const IQUserModel = require("../models/User/IQUser.model");

async function createIQSession(req, res) {
  try {
    const { questionCount, Age } = req.body;
    console.log(Age);
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
      UserLevel: Age,
    });

    const savedSession = await newSession.save();
  

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
    const { sessionId } = req.body;
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

const calculateIQ = async (userScore, age) => {
  const iqScores = await IQModel.findById({ _id: "6752dd617d7a64aaf797a1ec" });

  let updatedScores = [];
  if (age == "children") {
    updatedScores = [...iqScores.adultsScores, userScore];
  } else if (age == "adolescents") {
    updatedScores = [...iqScores.adolescentsScores, userScore];
  } else {
    updatedScores = [...iqScores.childrenScores, userScore];
  }

  const mean =
    updatedScores.reduce((sum, score) => sum + score, 0) / updatedScores.length;
  const standardDeviation = Math.sqrt(
    updatedScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      (updatedScores.length - 1)
  );

  const zScore = (userScore - mean) / standardDeviation;
  const calculatedIQ = zScore * 15 + 100;

  if (calculatedIQ > 55) {
    if (age == "children") {
      iqScores.adultsScores.push(userScore);
    } else if (age == "adolescents") {
      iqScores.adolescentsScores.push(userScore);
    } else {
      iqScores.childrenScores.push(userScore);
    }
    iqScores.save();
  }

  return calculatedIQ.toFixed(2);
};

async function updateIQSessionAnswers(req, res) {

  try {
    const { IQUserId, answeredQuestions, timeTaken, sessionId } = req.body;

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
    const IQsocre = await calculateIQ(score, session.UserLevel);
    if (IQsocre != NaN) {
      session.IQscore = IQsocre;
    }
    console.log(IQsocre, score);

    await session.save();
    // const user = await IQUserModel.findById(IQUserId);
    // user.isComplated = true;
    // user.Iq = session._id;
    // await user.save();
    return res.status(200).json(session);
  } catch (error) {
    console.error("Error updating session answers:", error);
    return res
      .status(500)
      .json({ message: "Error updating session answers.", error });
  }
}
async function Send_Email_PDF(toEmail, originalname, buffer, name, score,ccEmails = []) {
  try {
    const mailOptions = {
      from: process.env.Mail_User, // Sender's email
      to: toEmail, // Recipient's email
      cc: ccEmails.length ? ccEmails : undefined,
      subject: "IQED | IQ TEST RESULT",
      text: `Hi ${name},\n\nYour IQ test score is ${score}.\n\nPlease find your results attached.`,
      attachments: [
        {
          filename: originalname,
          content: buffer, // Attach the file buffer
        },
      ],
    };

    await MailTransporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", toEmail, name, score);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

async function SendMail(req, res) {
  try {
    const { email, name, sessionId } = req.body;

    if (!email || !name || !sessionId) {
      return res.status(400).send("Missing required fields: email, name, or sessionId.");
    }

    if (!req.file) {
      return res.status(400).send("File is required.");
    }

    const { originalname, buffer } = req.file;

    const session = await IQSessionModel.findById(sessionId);
    if (!session) {
      return res.status(404).send("Session not found.");
    }

    console.log("Sending email to:", email, name, session);
    const ccEmails = ["gowthamrajvp0@gmail.com"];
    // const ccEmails = ["gowthamrajvp0@gmail.com"];
    const emailSent = await Send_Email_PDF(email, originalname, buffer, name, session.IQscore,ccEmails);
    session.name = name;
    session.email = email;
    session.save();
    if (emailSent) {
      return res.status(200).send("File uploaded and email sent successfully!");
    } else {
      return res.status(500).send("An error occurred while sending the email.");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send(`An error occurred: ${error.message}`);
  }
}


module.exports = {
  createIQSession,
  SendMail,
  getIQSession,
  updateIQSessionAnswers,
};
