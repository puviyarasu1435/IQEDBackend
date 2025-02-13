const Order = require("../models/Ecart/Order.model");
const ChallengeModel = require("../models/Test/Challenge.model");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const S3 = require("../config/aws.config");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const FeedbackModel = require("../models/User/Feedback.model");
const BUCKET_NAME = process.env.S3_BUCKET_NAME;
async function generateSignedUrl(imageKey) {
  return await getSignedUrl(
    S3,
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imageKey,
    }),
    { expiresIn: 60 * 60 * 24 } // URL expires in 1 hour
  );
}

async function uploadImagesToS3(file) {
  if (!file || !file.buffer || !file.originalname || !file.mimetype) {
    throw new Error("Invalid file object. Ensure file is correctly uploaded.");
  }
  const fileKey = `${Date.now()}-${file.originalname}`;
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await S3.send(new PutObjectCommand(params));

  return fileKey;
}
// Create a new challenge
const createChallenge = async (req, res) => {
  try {
    console.log(req.body);
    let Imageurl = "";
    if (req.file) {
      let profileImageFile = Array.isArray(req.file) ? req.file[0] : req.file;
      let profileImage = await uploadImagesToS3(profileImageFile);
      if (profileImage) {
        Imageurl = profileImage;
        console.log("Uploaded Profile Image:", profileImage);
      }
    }
    const challenge = new ChallengeModel({
      sponsoreName: req.body.sponsoreName,
      title: req.body.title,
      Topic: req.body.Topic,
      TestTime: req.body.TestTime,
      eligibleGem: req.body.eligibleGem,
      participantsCount: req.body.participantsCount,
      productName: req.body.productName,
      description: req.body.description,
      banner: Imageurl,
    });
    await challenge.save();
    res
      .status(201)
      .json({ success: true, message: "Challenge created", challenge });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllChallenges = async (req, res) => {
  try {
    const challenges = await ChallengeModel.find().lean(); // Use lean() for better performance

    const challengesWithBannerUrls = await Promise.all(
      challenges.map(async (challenge) => {
        const profileUrl = challenge.banner
          ? await generateSignedUrl(challenge.banner)
          : null;

        return {
          ...challenge, // Use challenge directly since it's already a plain object
          banner: profileUrl,
        };
      })
    );

    res.status(200).json({ success: true, challenges: challengesWithBannerUrls });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllChallengesByID = async (req, res) => {
  try {
    const Id = req.params.id;
    console.log(Id);
    const challenges = await ChallengeModel.findById(Id);
    res.status(200).json({ success: true, challenges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const CheckUserOrder = async (req, res) => {
  try {
    const CId = req.params.id;
    const Id = req._id;
    const OrderData = await Order.find({ Challenge: CId, userId: Id });

    if (OrderData.length > 0) {
      // Check if any order exists
      res.status(200).send(true);
    } else {
      res.status(200).send(false);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update challenge: decrease participantsCount and add a winner
const updateChallenge = async (req, res) => {
  try {
    const { challengeId, winnerId } = req.body;

    const challenge = await ChallengeModel.findById(challengeId);
    if (!challenge) {
      return res
        .status(404)
        .json({ success: false, message: "Challenge not found" });
    }

    // Decrease participants count but ensure it doesn't go below zero
    challenge.participantsCount = Math.max(0, challenge.participantsCount - 1);

    // Set Active to false if participants count reaches zero
    if (challenge.participantsCount === 0) {
      challenge.Active = false;
    }

    // Add winner if not already in the list
    if (!challenge.Winners.includes(winnerId)) {
      challenge.Winners.push(winnerId);
    }

    await challenge.save();
    res
      .status(200)
      .json({ success: true, message: "Challenge updated", challenge });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a challenge
const deleteChallenge = async (req, res) => {
  try {
    const { challengeId } = req.body;

    const deletedChallenge = await ChallengeModel.findByIdAndDelete(
      challengeId
    );
    if (!deletedChallenge) {
      return res
        .status(404)
        .json({ success: false, message: "Challenge not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Challenge deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  deleteChallenge,
  updateChallenge,
  createChallenge,
  getAllChallenges,
  getAllChallengesByID,
  CheckUserOrder,
};
