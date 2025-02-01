const {
  getUser,
  getActiveUsersLast30Days,
  getTotalUsers,
  getUsersCreatedThisWeek,
  getUsersCreatedLastWeek,
  getAllUsers,
} = require("../controllers/Admin.controller");
const { bulkCareerPaths } = require("../controllers/Career.controller");
const {
  FeedbackGet,
  FeedbackGetById,
} = require("../controllers/Feedback.controller");
const { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrder } = require("../controllers/Order.controller");
const {
  getProductById,
  updateProduct,
  deleteProduct,
  createProduct,
  getAllProducts,
} = require("../controllers/Product.controller");
const { UpdateProgress } = require("../middleware/CareerUpdate");

const router = require("express").Router();

router.get("/users/active-last-30-days", getActiveUsersLast30Days);
router.get("/users/total", getTotalUsers);
router.get("/users/created-this-week", getUsersCreatedThisWeek);
router.get("/users/created-last-week", getUsersCreatedLastWeek);
router.get("/users/all", getAllUsers);

router.get("/feedback", FeedbackGet);
router.get("/feedback/:id", FeedbackGetById);

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



module.exports = router;
