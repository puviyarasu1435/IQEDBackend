const { getGameSession, updateGameSessionAnswers } = require("../controllers/GameSession.controller");

const router = require("express").Router();


// Auth
router.post("/Get",getGameSession)
router.post("/update",updateGameSessionAnswers)



module.exports = router;