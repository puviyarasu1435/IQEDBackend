const FeedbackModel = require("../models/User/Feedback.model");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const S3 = require("../config/aws.config");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { UserModel } = require("../models");

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Upload images to S3 and return only the file keys
async function uploadImagesToS3(files) {
  const fileKeys = [];

  for (const file of files) {
    const fileKey = `${Date.now()}-${file.originalname}`;
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await S3.send(new PutObjectCommand(params));
    fileKeys.push(fileKey);
  }

  return fileKeys;
}

// Generate signed URLs for stored file keys
async function generateSignedUrls(imageKeys) {
  const signedUrls = await Promise.all(
    imageKeys.map(async (key) => {
      return await getSignedUrl(
        S3,
        new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        }),
        { expiresIn: 3600 } // URL expires in 1 hour
      );
    })
  );
  return signedUrls;
}

// POST Feedback
async function FeedbackPost(req, res) {
  try {
    const {
      type,
      feedback,
      topic,
      question,
      options,
      correctOption,
      explanation,
    } = req.body;
    let imageList = [];

    if (type === "bug" && req.files) {
      imageList = await uploadImagesToS3(req.files); // Store only file keys
    }
    let feedbackData = {};
    if (type === "suggestQuestions") {
      feedbackData = {
        userId: req._id,
        type,
        suggestQuestions: {
          topic,
          question,
          options,
          correctOption,
          explanation,
        },
      };
    } else {
      feedbackData = {
        userId: req._id,
        type,
        feedback,
        imageList,
      };
    }

    const newFeedback = new FeedbackModel(feedbackData);
    await newFeedback.save();

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback: newFeedback,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function FeedbackApproved(req, res) {
  try {
    const { userId, feedId } = req.body;
    const User = await UserModel.findById({ _id: userId });
    const Feedback = await FeedbackModel.findById({ _id: feedId });

    if (!User && !Feedback) {
      res.status(401).json({ error: error.message });
    }
    User.earnings.iqGems += 100;
    Feedback.Approved = true;
    Feedback.save();
    User.save();
    res.status(201).json({
      message: "Feedback Approved successfully",
      feedback: Feedback,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


// GET all Feedback
async function FeedbackGet(req, res) {
  try {
    const feedbacks = await FeedbackModel.find().populate(
      "userId",
      "name email"
    );

    // Convert stored file keys to signed URLs
    const feedbacksWithUrls = await Promise.all(
      feedbacks.map(async (feedback) => {
        feedback = feedback.toObject();
        feedback.imageList = await generateSignedUrls(feedback.imageList);
        return feedback;
      })
    );

    res.status(200).json(feedbacksWithUrls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET Feedback by ID
async function FeedbackGetById(req, res) {
  try {
    let feedback = await FeedbackModel.findById(req.params.id).populate(
      "userId",
      "name email"
    );
    if (!feedback)
      return res.status(404).json({ message: "Feedback not found" });

    feedback = feedback.toObject();
    feedback.imageList = await generateSignedUrls(feedback.imageList); // Convert file keys to URLs

    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Routes

module.exports = {
  FeedbackGetById,
  FeedbackGet,
  FeedbackPost,
  FeedbackApproved,
};
