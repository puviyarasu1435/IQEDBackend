const bcrypt = require("bcrypt");
const { jwt_GetToken } = require("../config/jwt.config");
const { UserModel } = require("../models");
const MailTransporter = require("../config/mailer.config");
const UserProgress = require("../models/User/UserProgress.model");
const { CareerPath, Lesson, Level } = require("../models/Test/careerpath");

const EmailOTP = {};

function Generate_OTP(Email) {
  let OTP = Math.floor(Math.random() * (1000000 - 99999)) + 99999;
  EmailOTP[Email] = OTP;
  return OTP;
}

async function UserSignUp(req, res) {
  try {
    const {
      email,
      password,
      name,
      age,
      schoolName,
      parentsName,
      grade,
      mobileNumber,
      userName,
    } = req.body;

    console.log(req.body);

    if (!email || !password || !name || !age || !parentsName) {
      return res
        .status(400)
        .send("Required fields: email, password, name, and age.");
    }

    const existingUser = await UserModel.findOne({ "auth.email": email });
    if (existingUser) {
      return res.status(409).send("Email is already registered.");
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      auth: {
        email,
        password: hashedPassword, // Save the hashed password
      },
      name,
      age,
      schoolName,
      grade,
      mobileNumber,
      parentsName,
      userName,
      valueBaseQuest: {
        Quest: "6748fdb095e222aff65dc6b2",
      },
    });

    await newUser.save();

    const careerPaths = await CareerPath.findOne()
  .populate({
    path: "levels",
    populate: {
      path: "lessons"
    },
  });
    console.log(careerPaths)
    const progressRecords = [];

    const newUserProgress = new UserProgress({
      user: newUser._id,
      careerPath: careerPaths._id,
      levelProgress: [],
    });

    for (const level of careerPaths.levels) {
      const newLevelProgress = {
        level: level._id,
        completed: false,
        lessonProgress: [],
      };

      for (const lesson of level.lessons) {
        const newLessonProgress = {
          lesson: lesson._id,
          completed: false,
          topicProgress: [],
        };

        for (const topic of lesson.topics) {
          newLessonProgress.topicProgress.push({
            topic: topic._id,
            completed: false,
            score: 0,
          });
        }

        newLevelProgress.lessonProgress.push(newLessonProgress);
      }

      newUserProgress.levelProgress.push(newLevelProgress);
    }

    await newUserProgress.save();
    progressRecords.push(newUserProgress._id);
    newUser.CourseProgress = progressRecords[0];
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
    });
  } catch (error) {
    console.error("Error during user signup:", error);
    return res.status(500).send("An error occurred during signup.");
  }
}

async function UserSignIn(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .send({ message: "Email and password are required." });
    }

    const user = await UserModel.findOne({ "auth.email": email }).select(
      "_id auth"
    );
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.auth.password);
    if (!isPasswordMatch) {
      return res.status(404).send({ message: "Invalid password." });
    }

    const token = jwt_GetToken({ _id: user._id });

    req.session.Token = token;

    return res
      .status(200)
      .json({ message: "Authentication successful", token });
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).send("An error occurred. Please try again.");
  }
}

async function sendEmailOTP(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email are required." });
    }

    const user = await UserModel.findOne({ "auth.email": email });

    if (user) {
      return res.status(401).json({ message: "Email already exists" });
    }

    const OTP = Generate_OTP(email);
    await MailTransporter.sendMail({
      from: process.env.Email_User,
      to: email,
      subject: "IQED | Email Verification OTP",
      html: `<h1>IQED | Overcome Math Anxiety and Boost Your Memory </h1><p>Your Verification OTP is </p><b><h2>${OTP}</h2></b>`,
    }).then(() => {
      return res
        .status(200)
        .json({ message: "OTP successfuly send Your Mail" });
    });
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).send("An error occurred. Please try again.");
  }
}

async function verifyEmailOTP(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }
    if (EmailOTP[email] === Number(otp)) {
      return res
        .status(200)
        .json({ message: "Verfy OTP successfuly", isVeridy: true });
    } else {
      return res
        .status(401)
        .json({ message: "Not Valid OTP", isVeridy: false });
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).send("An error occurred. Please try again.");
  }
}

async function checkEmailExists(req, res) {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email are required." });
    }

    const user = await UserModel.findOne({ "auth.email": email });
    // console.log(user);
    if (user) {
      return res.status(200).send(true);
    }
    return res.status(400).send(false);
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).send("An error occurred. Please try again.");
  }
}
async function checkUserNameExists(req, res) {
  try {
    const { UserName } = req.query;

    if (!UserName) {
      return res.status(200).json({ message: "UserName are required." });
    }

    const user = await UserModel.findOne({ userName: UserName });
    // console.log(user);
    if (user) {
      return res.status(200).send(true);
    }
    return res.status(401).send(false);
  } catch (error) {
    console.error("Error during authentication:", error);
    return res.status(500).send("An error occurred. Please try again.");
  }
}

async function sendEmail(toEmail, userid, cpassword, url) {
  try {
    const mailOptions = {
      from: process.env.Mail_User,
      to: toEmail,
      subject: "IQED | FORGETPASSWORD",
      html: `<a href='${url}/forget/${userid}/?token="${cpassword}"' target='_blank'>Change New Password</a>`,
    };

    await MailTransporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

async function ForgetPassword(req, res) {
  try {
    const { toEmail, url } = req.body;
    const user = await UserModel.findOne({ "auth.email": toEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await sendEmail(toEmail, user._id, user.auth.password, url)
      .then(() => {
        res.status(200).json({ message: "Forget Link Send to Your Email" });
      })
      .catch((e) => {
        res.status(400).json({ message: e });
      });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
}

async function NewPassword(req, res) {
  try {
    const { userid, token, NewPassword } = req.body;

    // Find user by ID and token
    const user = await UserModel.findOne({
      _id: userid,
      "auth.password": token,
    });

    if (!user || !NewPassword) {
      return res
        .status(404)
        .json({ message: "User not found or Token Expire" });
    }
    console.log(token);

    const hashedPassword = await bcrypt.hash(NewPassword, 10);

    user.auth.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password Changed" });
  } catch (error) {
    console.error("Error updating user password:", error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  UserSignIn,
  UserSignUp,
  sendEmailOTP,
  verifyEmailOTP,
  checkEmailExists,
  ForgetPassword,
  NewPassword,
  checkUserNameExists,
};
