const bcrypt = require("bcrypt");
const { jwt_GetToken } = require("../config/jwt.config");
const { UserModel, SectionModel } = require("../models");
const MailTransporter = require("../config/mailer.config");

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
      grade,
      mobileNumber,
      userName,
    } = req.body;
    console.log(req.body);

    if (!email || !password || !name || !age) {
      return res
        .status(400)
        .send("Required fields: email, password, name, and age.");
    }

    const existingUser = await UserModel.findOne({ "auth.email": email });
    if (existingUser) {
      return res.status(409).send("Email is already registered.");
    }
    const sectionlist = await SectionModel.find().populate({
      path: "lesson", // Populate the 'lesson' field
      populate: {
        path: "topics", // Populate the 'topics' field inside each lesson
      },
    });
    console.log(sectionlist[0]);
    if (!sectionlist || sectionlist.length === 0) {
      return res.status(400).send("No sections found in the database.");
    }

    // Password hashing (if not done by pre-save hook in the schema)
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user object
    const newUser = new UserModel({
      auth: {
        email,
        password, // Password will be hashed by the pre-save hook in your schema, or you can hash it here
      },
      name,
      age,
      schoolName,
      grade,
      mobileNumber,
      userName,
      valueBaseQuest: {
        Quest: "6748fdb095e222aff65dc6b2",
      },
      careerPathProgress: {
        sections: [
          {
            sectionId: sectionlist[0]._id,
            isCompleted: false,
            lessons: [
              {
                lessonId: sectionlist[0].lesson[0]._id,
                isCompleted: false,
                topics: [
                  {
                    topicId: sectionlist[0].lesson[0].topics[0]._id,
                    isCompleted: false,
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    // Check if section and lesson data exist

    // Save the user to the database
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
        .json({ message: "Email and password are required." });
    }

    const user = await UserModel.findOne({ "auth.email": email }).select(
      "_id auth"
    );
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.auth.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt_GetToken({ _id: user._id });

    req.session.Token = token;

    return res.status(200).json({ message: "Authentication successful" });
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

module.exports = {
  UserSignIn,
  UserSignUp,
  sendEmailOTP,
  verifyEmailOTP,
  checkEmailExists,
};
