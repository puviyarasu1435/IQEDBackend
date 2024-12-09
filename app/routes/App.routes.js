const { jwt_GetToken } = require("../config/jwt.config");

const router = require("express").Router();

router.get("/", (req, res) => {
  res.send("Server is Online V2");
});
router.get("/test", (req, res) => {
  req.session.User = jwt_GetToken({test:"ffff"});
  res.sendStatus(200);
});

module.exports = router;
