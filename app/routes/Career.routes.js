const {
  postLesson,
  getAllLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
} = require("../controllers/Lesson.controller");
const { createQuest } = require("../controllers/Quest.controller");
const {
  postQuestions,
  getQuestions,
  putQuestions,
  deleteQuestions,
} = require("../controllers/Question.controller");
const { postSection, getAllSections, getSectionById, updateSection, deleteSection, getAll } = require("../controllers/Section.controller");
const {
  getAllTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
  postTopicsInBulk,
} = require("../controllers/Topic.controller");
const router = require("express").Router();

router.get("/question:id", getQuestions);
router.get("/question", deleteQuestions);
router.post("/question", postQuestions);
router.put("/question:id", putQuestions);
router.delete("/question:id", deleteQuestions);

router.post("/topics", postTopicsInBulk);
router.get("/topics", getAllTopics);
router.get("/topics/:id", getTopicById);
router.put("/topics/:id", updateTopic);
router.delete("/topics/:id", deleteTopic);

router.post("/lessons", postLesson);
router.get("/lessons", getAllLessons);
router.get("/lessons/:id", getLessonById);
router.put("/lessons/:id", updateLesson);
router.delete("/lessons/:id", deleteLesson);


router.post("/sections", postSection);
router.get("/sections", getAllSections);
router.get("/sections/getall",getAll);
router.get("/sections/:id", getSectionById);
router.put("/sections/:id", updateSection);
router.delete("/sections/:id", deleteSection);


router.post("/quest", createQuest);

module.exports = router;
