const { GetCareerpathById } = require("../controllers/Career.controller");
const {
  newCourse,
  GetCourse,
  GetCourseById,
} = require("../controllers/Course.controller");
const {   postQuestions,
  putQuestions,
  deleteQuestions,
  getAllQuestions,
  getQuestions, } = require("../controllers/Question.controller");
const {
  getAllTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
  postTopicsInBulk,
} = require("../controllers/Topic.controller");

const router = require("express").Router();
router.get("/question:id", getQuestions);
router.get("/question/delete", deleteQuestions);
router.get("/question", getAllQuestions);
router.post("/question", postQuestions);
router.put("/question:id", putQuestions);
router.delete("/question:id", deleteQuestions);
router.post("/topics", postTopicsInBulk);
router.get("/topics", getAllTopics);
router.get("/topics/:id", getTopicById);
router.put("/topics/:id", updateTopic);
router.delete("/topics/:id", deleteTopic);
router.post("/courses", newCourse);
router.get("/courses", GetCourse);
router.get("/courses/:id", GetCourseById);


// router.post("/quest", createQuest);

module.exports = router;
