const { getUser } = require("../controllers/Admin.controller");

const router = require("express").Router();


// GET
router.get("/user/get",getUser)
// router.get("/Earnings",getEarnings)
// router.get("/leaderboard",getleaderboard)

// UPDATE
// router.put("/xp",putXP)
// router.put("/iqgem",putGem)
// router.put("/update",UpdateUser)


module.exports = router;