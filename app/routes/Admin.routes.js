const {
  getUser,
  getActiveUsersLast30Days,
  getTotalUsers,
  getUsersCreatedThisWeek,
  getUsersCreatedLastWeek,
  getAllUsers,
  deleteUsers,
  UpdateUser,
  deleteFeedback,
  getTopicsByLevelId,
  deleteTopicsByLevelId,
} = require("../controllers/Admin.controller");
const { bulkCareerPaths, GetCareerPathAdmin } = require("../controllers/Career.controller");
const { createChallenge, deleteChallenge, getAllChallenges, getAllChallengesByID } = require("../controllers/Challenge.controller");
const {
  FeedbackGet,
  FeedbackGetById,
  FeedbackApproved,
} = require("../controllers/Feedback.controller");
const { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrder } = require("../controllers/Order.controller");
const {
  getProductById,
  updateProduct,
  deleteProduct,
  createProduct,
  getAllProducts,
} = require("../controllers/Product.controller");
const { getAllQuestions, deleteQuestions, postQuestions } = require("../controllers/Question.controller");
const { GetQuizSessionCount, GetIQSessionCount } = require("../controllers/QuizSession.controller");
const { GetCareerLevels, CreateNewLevel, CreateEditLevel, GetCareerDraftLevels, deleteLevelById, PublishCareer, EditLevelOrder } = require("../controllers/Syllabus.controller");
const { GenerateQuestions } = require("../controllers/Test/QuestionsCreater");
const { getAllTopics, postTopicsInBulk } = require("../controllers/Topic.controller");
const { UpdateProgress } = require("../middleware/CareerUpdate");

const multer  = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = require("express").Router();

router.get("/users/active-last-30-days", getActiveUsersLast30Days);
router.get("/users/total", getTotalUsers);
router.get("/users/created-this-week", getUsersCreatedThisWeek);
router.get("/users/created-last-week", getUsersCreatedLastWeek);
router.get("/users/all", getAllUsers);
router.post("/users/delete", deleteUsers);
router.post("/users/update",upload.single('file'), UpdateUser);

router.post("/getTopicsByLevelId", getTopicsByLevelId);
router.post("/deleteTopicsByLevelId", deleteTopicsByLevelId);

router.get("/question", getAllQuestions);
router.post("/question/delete", deleteQuestions);
router.post("/question", postQuestions);
router.post("/topics", postTopicsInBulk);
router.get("/feedback", FeedbackGet);
router.post("/dlefeedback", deleteFeedback);
router.get("/feedback/:id", FeedbackGetById);
router.post("/FeedbackApproved", FeedbackApproved);
router.get("/GetCareerPathAdmin", GetCareerPathAdmin);
router.get("/topics", getAllTopics);
router.get("/GetQuizSessionCount", GetQuizSessionCount);
router.get("/GetIQSessionCount", GetIQSessionCount);

router.post("/products", createProduct);
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

router.post("/orders", createOrder);
router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderById);
router.put("/orders/:id/status", updateOrderStatus);
router.delete("/orders/:id", deleteOrder);

router.post("/bulkCareerPaths", bulkCareerPaths);
router.post("/UpdateProgress", UpdateProgress);

router.post("/challengeCreate", upload.single('file1'),createChallenge);
router.post("/challenge/delete", deleteChallenge);
router.get("/challenge", getAllChallenges);
router.get("/challenge/:id", getAllChallengesByID);


router.post("/generatequestions", GenerateQuestions);


router.get("/GetCareerLevels", GetCareerLevels);
router.get("/GetCareerDraftLevels", GetCareerDraftLevels);
router.post("/CreateNewLevel", CreateNewLevel);
router.post("/deleteLevelById", deleteLevelById);
router.post("/CreateEditLevel", CreateEditLevel);
router.post("/EditLevelOrder", EditLevelOrder);
router.post("/PublishCareer", PublishCareer);




module.exports = router;
