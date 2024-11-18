const nodemailer = require("nodemailer");
// const TwilioClient = require('twilio')("dddd", "dddd");


const EmailOTP = {};


const transporter = nodemailer.createTransport({
  service:"gmail",
  port: 587,
  secure: false,
  auth: {
    user: process.env.Email_User,
    pass: process.env.Email_Password,
  },
});


function Generate_OTP(Email) {
  let OTP = Math.floor(Math.random() * (1000000 - 99999)) + 99999;
  EmailOTP[Email] = OTP;
  return OTP;
}


async function Send_Mobile_OTP(MobileNumber) {
  // const verification = await TwilioClient.verify.v2
  //   .services(process.env.Mobile_User)
  //   .verifications.create({
  //     channel: "sms",
  //     to: MobileNumber,
  //   });
  // return(verification.status);
  return(true);
}


async function Verify_Mobile_OTP(MobileNumber,OTP) {
  // const verificationCheck = await TwilioClient.verify.v2
  //   .services(process.env.Mobile_User)
  //   .verificationChecks.create({
  //     code: OTP,
  //     to: MobileNumber,
  //   });

  // return(verificationCheck.status);
   return(true);
}


function Verify_Email_OTP(Email,OTP) {
  
  return EmailOTP[Email] === Number(OTP);
}


async function Send_Email_OTP(ToMail) {
 const OTP = Generate_OTP(ToMail)
  const info = await transporter.sendMail({
    from: process.env.Email_User, 
    to: ToMail, 
    subject: "IQED | Email Verification OTP", 
    html: `<h1>IQED | Overcome Math Anxiety and Boost Your Memory </h1><p>Your Verification OTP is </p><b><h2>${OTP}</h2></b>`,
  });
  return(true);
}



// async function Send_Email_PDF(toEmail, file) {
//   try {
//     console.log(file.path)
//     const filePath = path.join(file.path, file.filename);
//     const mailOptions = {
//       from: process.env.Email_User, // Sender's email
//       to: toEmail, // Recipient's email
//       subject: "File Uploaded",
//       text: `A new file has been uploaded: ${file.originalname}`,
//       attachments: [
//         {
//           filename: file.originalname,
//           path: filePath,
//         },
//       ],
//     };

//     await transporter.sendMail(mailOptions);
//     console.log("Email sent successfully to:", toEmail);
//     return true;
//   } catch (error) {
//     console.error("Error sending email:", error);
//     return false;
//   }
// }


















module.exports = {Send_Email_OTP,Generate_OTP,Send_Mobile_OTP,Verify_Mobile_OTP,Verify_Email_OTP }
