const { createQuizSession, updateQuizSessionAnswers, getQuizSession } = require("../controllers/QuizSession.controller");

const router = require("express").Router();


// POST
router.post("/createSession",createQuizSession)
router.get("/getSession",getQuizSession)
router.put("/updateAnswers",updateQuizSessionAnswers)




module.exports = router;