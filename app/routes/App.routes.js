const { jwt_GetToken } = require("../config/jwt.config");

const router = require("express").Router();

router.get("/", (req, res) => {
  res.send("Server is Online V2");
});
router.get("/test", (req, res) => {
  res.send(jwt_GetToken({ test: "ffff" }));
});
router.get("/test1", (req, res) => {
  res.send("d");
});

module.exports = router;
