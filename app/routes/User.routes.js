const { getUser, getEarnings, putXP, putGem, getleaderboard, UpdateUser } = require("../controllers/User.controller");
const router = require("express").Router();


// GET
router.get("/get",getUser)
router.get("/Earnings",getEarnings)
router.get("/leaderboard",getleaderboard)

// UPDATE
router.put("/xp",putXP)
router.put("/iqgem",putGem)
router.put("/update",UpdateUser)


module.exports = router;