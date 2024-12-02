const { UserSignIn,UserSignUp, sendEmailOTP, verifyEmailOTP, checkEmailExists } = require("../controllers/Auth.controller");
const router = require("express").Router();


// Auth
router.post("/login",UserSignIn)
router.post("/register",UserSignUp)
router.post("/sendEmailOTP",sendEmailOTP)
router.post("/verifyEmail",verifyEmailOTP)
router.post("/checkEmailExists",checkEmailExists)


module.exports = router;