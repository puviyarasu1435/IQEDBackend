const { createIQSession,getIQSession,updateIQSessionAnswers, SendMail} = require("../controllers/IQSession.controller");
const { deleteQuestions,getAllQuestions,getQuestions,postQuestions,putQuestions,postBulkQuestions} = require("../controllers/IQQuestion.controller");
const {updateIQ,IQUserVerify,Createbulkusers, getIQUser} = require("../controllers/IQUser.controller")
const router = require("express").Router();

const multer = require("multer");
const upload = multer();
// POST
router.post("/createSession",createIQSession)
router.post("/getSession",getIQSession)
router.put("/updateAnswers",updateIQSessionAnswers)
router.post("/SendEmail",upload.single("file"),SendMail)

router.post("/bulk-users",Createbulkusers)
// router.post("/IQUsersVerify",IQUserVerify)
router.post("/update-iq",updateIQ)


router.get("/getIQUser",getIQUser)



router.get("/question:id", getQuestions);
router.get("/question", deleteQuestions);
// router.post("/question", postQuestions);

router.post("/question", postBulkQuestions);    
router.put("/question:id", putQuestions);
router.delete("/question:id", deleteQuestions);

module.exports = router;