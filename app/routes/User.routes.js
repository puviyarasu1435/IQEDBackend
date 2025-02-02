const { GetCareerpathById } = require("../controllers/Career.controller");
const { updateChallenge, getAllChallenges, getAllChallengesByID } = require("../controllers/Challenge.controller");
const { FeedbackPost, FeedbackGet, FeedbackGetById } = require("../controllers/Feedback.controller");
const { getOrderById, createOrder, getAllUserOrders } = require("../controllers/Order.controller");
const { getAllProducts, getProductById } = require("../controllers/Product.controller");
const { getUser, getEarnings, putXP, putGem, getleaderboard, UpdateUser } = require("../controllers/User.controller");
const router = require("express").Router();
const multer  = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// GET
router.get("/get",getUser)
router.get("/Earnings",getEarnings)
router.get("/leaderboard",getleaderboard)

// UPDATE
router.put("/xp",putXP)
router.put("/iqgem",putGem)
router.put("/update",UpdateUser)


router.post("/feedback", upload.array("images"), FeedbackPost);
router.get('/products', getAllProducts);
router.get("/products/:id", getProductById);

router.post("/orders", createOrder);
router.get("/orders", getAllUserOrders);
router.get("/orders/:id", getOrderById);
router.get("/Careerpath", GetCareerpathById);
router.put("/challengeUpdate", updateChallenge);
router.get("/challenge", getAllChallenges);
router.get("/challenge/:id", getAllChallengesByID);

module.exports = router;