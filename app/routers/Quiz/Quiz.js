const express = require("express");
const router = express.Router();
const QuizModel = require("../../models/QuizModel.js");
const { Token_JWT_Verify } = require("../../config/jwt.config");
const CategoryModel = require("../../models/CategoryModel.js");
const QuizSessionModel = require("../../models/QuizSessionModel");
const multer = require("multer");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");



// router.post("/Upload",Token_JWT_Verify,(req,res)=>{

//     const Quiz = new QuestionBank({
//         Topic:"Test",
//         Questions:[{Question:"Test quiz",
//         Choose:[1,2,4,5],
//         Answer:"Testans"}]
//     });
//     Quiz.save()
//     .then((data) => {
//         res.status(201).json(data);
//     })
//     .catch((err) => {
//         console.error(err);
//         res.sendStatus(500);
//     });
// });

router.post("/categories", async (req, res) => {
  try {
    // Create a new instance of the Category model with data from the request body
    const newCategory = new CategoryModel({
      name: req.body.name,
      description: req.body.description,
    });

    // Save the new category to the database
    const savedCategory = await newCategory.save();

    // Return the saved category in the response
    res.status(201).json(savedCategory);
  } catch (error) {
    // Handle duplicate or other validation errors
    res.status(400).json({ message: error.message });
  }
});

router.post("/questions", async (req, res) => {
  try {
    console.log(req.body);
    // Create a new instance of the QuizModel with data from the request body
    const newQuestion = new QuizModel({
      type: req.body.type,
      question: req.body.question,
      questionImage: req.body.questionImage,
      options: req.body.options,
      correctAnswer: req.body.correctAnswer,
      difficulty: req.body.difficulty,
      categories: req.body.categories,
    });
    const savedQuestion = await newQuestion.save();

    // Return the saved question in the response
    res.status(200).json(savedQuestion);
  } catch (error) {
    // Handle any errors during saving
    res.status(400).json({ message: error.message });
  }
});

router.post("/questionslist", async (req, res) => {
  try {
    // Extract the array of questions from the request body
    const questions = req.body;

    // Check if the request body contains an array
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Please provide an array of questions." });
    }

    // Use `insertMany` to save multiple questions at once
    const savedQuestions = await QuizModel.insertMany(questions);

    // Return the saved questions in the response
    res.status(200).json({
      message: "Questions added successfully",
      data: savedQuestions,
    });
  } catch (error) {
    // Handle any errors during saving
    res.status(400).json({ message: error.message });
  }
});




router.post("/create-session", async (req, res) => {
  try {
    const totalQuestions = 35; // Total number of questions required
    const { hostId } = req.body; // Extract host ID from the request body

    if (!hostId) {
      return res.status(400).json({ error: "hostId is required" });
    }

    // Category distribution and counts
    const categoryDistribution = {
      "Logical Reasoning": 9,          // 9 questions (40%)
      "Verbal Comprehension": 9,       // 9 questions (30%)
      "Working Memory": 8,             // 8 questions (20%)
      "Spatial Reasoning": 9           // 9 questions (10%)
    };

    const quizQuestions = [];

    for (const [categoryName, count] of Object.entries(categoryDistribution)) {
      // Step 1: Find the category by name
      const category = await CategoryModel.findOne({ name: categoryName });

      if (!category) {
        return res.status(404).json({ error: `Category ${categoryName} not found` });
      }

      // Step 2: Retrieve `count` random questions for the category
      const questions = await QuizModel.aggregate([
        { $match: { categories: category._id } }, // Match questions for the category
        { $sample: { size: count } },            // Randomly select `count` questions
      ]);

      if (questions.length < count) {
        return res.status(400).json({
          error: `Not enough questions available for category ${categoryName}`,
        });
      }
      quizQuestions.push(...questions);
    }

    // Step 3: Create a new quiz session
    const quizSession = new QuizSessionModel({
      host: hostId,
      status: "pending", // Quiz is in a pending state initially
      questionsList: quizQuestions.map((question) => question._id), // Store only question IDs
      questionCount: totalQuestions,
      createTime: new Date(),
      categories:'673a02297b8eb1366e5daa43'
    });

    // Save the session in the database
    await quizSession.save();

    // Step 4: Respond with the session and questions
    res.status(201).json({
      message: "Quiz session created successfully",
      sessionId: quizSession._id,
      host: quizSession.host,
      status: quizSession.status,
      questions: quizQuestions, // Full question objects for frontend use
      answeredQuestions: {}, // Initialize as an empty object
      score: 0,
    });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: error.message });
  }
});


router.get("/quiz-session/:id", async (req, res) => {
  try {
    // Get the session ID from URL parameters
    const { id } = req.params;

    // Find the quiz session in the database by ID
    const quizSession = await QuizSessionModel.findById(id)
      .populate("questionsList") // Populate questionsList with actual questions
      .populate("host") // Populate host with user data (if necessary)
      .exec();

    // If the session is not found, send a 404 error
    if (!quizSession || quizSession.status == "completed") {
      return res.status(404).json({ error: "Quiz session not found" });
    }
    res.json({
      sessionId: quizSession._id,
      host: quizSession.host,
      status: quizSession.status,
      questions: quizSession.questionsList,
      answeredQuestions: quizSession.answeredQuestions, // Initialize as empty object
      score: quizSession.score,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update quiz session by session ID and host ID
router.put("/quiz-session/:id", async (req, res) => {
  try {
    const { id } = req.params; // session ID from URL parameters
    const { hostId, score, answeredQuestions, status } = req.body; // Updated fields from request body

    // Find the quiz session with the specified session ID and host ID
    const quizSession = await QuizSessionModel.findOneAndUpdate(
      { _id: id, host: hostId }, // Match session ID and host ID
      {
        $set: {
          score,
          answeredQuestions,
          status,
        },
      },
      { new: true } // Return the updated document
    );

    // If the session is not found, send a 404 error
    if (!quizSession) {
      return res
        .status(404)
        .json({ error: "Quiz session not found or host ID mismatch" });
    }

    // Return the updated quiz session data
    res.json({
      sessionId: quizSession._id,
      host: quizSession.host,
      status: quizSession.status,
      questions: quizSession.questionsList,
      answeredQuestions: quizSession.answeredQuestions,
      score: quizSession.score,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: process.env.Email_User,
    pass: process.env.Email_Password,
  },
});

const uploadsPath = '/tmp/uploads';

if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath); // Specify upload folder
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname || "uploaded-file";
    const validName = originalName.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
    cb(null, `${timestamp}-${validName}`);
  },
});

const upload = multer({ storage });

async function Send_Email_PDF(toEmail, file) {
  try {
    const mailOptions = {
      from: process.env.Email_User, // Sender's email
      to: toEmail, // Recipient's email
      subject: "IQED | IQ TEST RESULT",
      html: `<h1>IQED | Overcome Math Anxiety and Boost Your Memory  </h1> <a href="http://localhost:5173/Auth"> Go Now </a> `,
      attachments: [
        {
          filename: "IQTestResult.pdf",
          path: file.path,
          contentType: "application/pdf",
        },
      ],
    };

    transporter.sendMail(mailOptions).then(()=>{
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error("Error removing file:", err);
        } else {
          console.log("File removed successfully:", file.path);
        }
      });
    });
    console.log("Email sent successfully to:", toEmail);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const { email } = req.body;

    if (!file) {
      return res.status(400).send("No file uploaded.");
    }
    if (!email) {
      console.error("Email address is missing!");
      return res.status(400).send("Email address is required.");
    }

    const emailSent = await Send_Email_PDF(email, file);

    // Clean up the file


    if (emailSent) {
      return res.status(200).send("File uploaded and email sent successfully!");
    } else {
      return res.status(500).send("An error occurred while sending the email.");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred.");
  }
});

module.exports = router;
