const JWT = require("jsonwebtoken");

function jwt_isVerify(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }
  
  // Extract the token (Assumes 'Bearer <token>' format)
  let UserToken = authHeader.split(' ')[1];
  if(UserToken!=undefined){
    JWT.verify(UserToken, process.env.JWT_Token, (err, Data) => {
        if (err) return res.status(403).json({ message: "UnAuthorized" });
        req._id = Data._id;
        next();
      });
  }else{
    res.status(403).json({ message: "UnAuthorized" });
  }
}

function jwt_GetToken(Data, ExpireTime = "24h") {
  const AccessToken = JWT.sign(Data, process.env.JWT_Token, {
    expiresIn: ExpireTime,
  });
  return AccessToken;
}

module.exports = { jwt_GetToken, jwt_isVerify };
