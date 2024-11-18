const JWT = require("jsonwebtoken")
const { createHash } = require('crypto');

// covert The Data into SHA256 Encode
function CovertToHash(Data){
    return createHash('sha256').update(Data).digest('base64');
}


// Jwt Auth verify function used to verify the token 
function Token_JWT_Verify(req,res,next){
    const AuthHeader = req.headers['authorization']
    const UserToken = AuthHeader && AuthHeader.split(' ')[1]
    if(UserToken == null){return res.sendStatus(401)}
    JWT.verify(UserToken,process.env.Access_Token,(err,Data)=>{
        if(err) return res.sendStatus(403)
        req._id = Data._id
        next()
    })
 } 


 // Jwt to Creater the Auth Token 
function Genrate_JWT_Token(Data,ExpireTime="1h"){
    const AccessToken = JWT.sign(Data,process.env.Access_Token,{expiresIn:ExpireTime})
    return({
        AccessToken:AccessToken
    })
 } 




module.exports = {CovertToHash,Genrate_JWT_Token,Token_JWT_Verify}