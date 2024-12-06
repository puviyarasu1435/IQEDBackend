const { createIQSession,getIQSession,updateIQSessionAnswers} = require("../controllers/IQSession.controller");
const { deleteQuestions,getAllQuestions,getQuestions,postQuestions,putQuestions,postBulkQuestions} = require("../controllers/IQQuestion.controller");

const router = require("express").Router();


// POST
router.post("/createSession",createIQSession)
router.get("/getSession",getIQSession)
router.put("/updateAnswers",updateIQSessionAnswers)

router.get("/question:id", getQuestions);
router.get("/question", deleteQuestions);
// router.post("/question", postQuestions);
router.post("/question", postBulkQuestions);
router.put("/question:id", putQuestions);
router.delete("/question:id", deleteQuestions);

module.exports = router;