const { UserSignIn,UserSignUp, sendEmailOTP, verifyEmailOTP, checkEmailExists, ForgetPassword, NewPassword, checkUserNameExists } = require("../controllers/Auth.controller");
const router = require("express").Router();


// Auth
router.post("/login",UserSignIn)
router.post("/register",UserSignUp)
router.post("/sendEmailOTP",sendEmailOTP)
router.post("/verifyEmail",verifyEmailOTP)
router.post("/checkEmailExists",checkEmailExists)
router.post("/checkUserNameExists",checkUserNameExists)
router.post("/ForgetPassword",ForgetPassword)
router.post("/NewPassword",NewPassword)


module.exports = router;