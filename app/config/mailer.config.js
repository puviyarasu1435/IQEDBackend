const nodemailer = require("nodemailer");

const MailTransporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: process.env.Mail_User,
    pass: process.env.Mail_Password,
  },
});


module.exports = MailTransporter;
