const express = require("express");
const router = express.Router();

const {
  CovertToHash,
  Genrate_JWT_Token,
  Token_JWT_Verify,
} = require("../../config/jwt.config.js");
const UserModel = require("../../models/UserModel.js");

const {
  Send_Email_OTP,
  Verify_Email_OTP,
  Send_Mobile_OTP,
  Verify_Mobile_OTP,
} = require("../../middleware/Verify.Service.js");

// router.get('/signin',Token_JWT_Verify, (req, res) => {
//     res.send(req._id);
// })

router.post("/SendEmailOTP", (req, res) => {
  const { Email } = req.body;
  console.log(Email);
  res.send(Send_Email_OTP(String(Email).toLocaleLowerCase()));
});

router.post("/VerifyEmailOTP", (req, res) => {
  const isVerify = Verify_Email_OTP(
    String(req.body.Email).toLocaleLowerCase(),
    req.body.OTP
  );
  console.log(isVerify);
  res.send(isVerify);
});

router.post("/SendMobileOTP", (req, res) => {
  const { MobileNumber } = req.body;
  res.send(Send_Mobile_OTP(MobileNumber));
});

router.post("/VerifyMobileOTP", (req, res) => {
  const { MobileNumber, OTP } = req.body;
  res.send(Verify_Mobile_OTP(MobileNumber, OTP));
});

router.post("/signIn", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Not Valid");
  }
  console.log(email, CovertToHash(password));
  UserModel.findOne({
    Email: String(email).toLocaleLowerCase(),
    Password: CovertToHash(password),
  })
    .then((user) => {
      console.log(user);
      if (user) {
        res.status(200).send(user);
      } else {
        res.sendStatus(401);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

router.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id; // or wherever you get the ID from
    if (!userId || userId === "null") {
      return res.status(400).send({ message: "Invalid user ID." });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.post("/SignUp", async (req, res) => {
  console.log(req.body);
  let Email = req.body.email;
  const userCount = await UserModel.countDocuments();
  const NewUser = new UserModel({
    UserName: req.body.userName,
    Name: req.body.name,
    Email: String(req.body.email).toLocaleLowerCase(),
    Age: req.body.age,
    Password: CovertToHash(req.body.password),
    School_Name: req.body.schoolName,
    Grade: req.body.grade,
    Rank: userCount + 1,
  });
  NewUser.save()
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

router.post("/updateUserStats", async (req, res) => {
  const { userId, streakIncrement, xpToAdd, rankToUpdate, iQGemsToAdd } =
    req.body;
  console.log(req.body)
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const today = new Date();
    const lastUpdateDate = user.lastStreakUpdate;
    if (
      lastUpdateDate == null ||
      lastUpdateDate.toDateString() != today.toDateString()
    ) {
      user.Streak += 1;
      user.lastStreakUpdate = today;
    }
    user.XP += xpToAdd || 0;
    if (rankToUpdate !== undefined) {
      user.Rank -= rankToUpdate;
    }
    user.IQGems += iQGemsToAdd || 0;

    await user.save();
    console.log(user)
    res.status(200).json({ message: "User stats updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/updateProfile", async (req, res) => {
  const { userId, Name, SchoolName, Grade, Password, profileImage } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }
  console.log(req.body)
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (Name) user.Name = Name;
    if (SchoolName) user.School_Name = SchoolName;
    if (Grade) user.Grade = Grade;
    if (Password) user.Password = CovertToHash(Password); // Make sure to hash the password
    if (profileImage) {
      user.ProfileImage = {
        fileName: `profile-${userId}.png`, // You can set a dynamic file name based on the user ID or other criteria
        base64: profileImage, // Store the base64 string
      };
    }

    await user.save();
    res.status(200).json({ message: "User profile updated successfully", user });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/sorted", async (req, res) => {
  try {
    const users = await UserModel.find()
      .sort({ Streak: -1, Rank: 1 }) // Sort by Streak (desc) and then by Rank (asc)
      .exec();

    // Send the sorted list of users as a response
    res.status(200).json({
      success: true,
      users: users,
    });
  } catch (err) {
    console.error("Error fetching users: ", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

module.exports = router;
