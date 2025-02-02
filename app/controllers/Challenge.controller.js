const Order = require("../models/Ecart/Order.model");
const ChallengeModel = require("../models/Test/Challenge.model");

// Create a new challenge
const createChallenge = async (req, res) => {
  try {
    const challenge = new ChallengeModel(req.body);
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
    const challenges = await ChallengeModel.find();
    res.status(200).json({ success: true, challenges });
  } catch (error) {
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
  
      if (OrderData.length > 0) { // Check if any order exists
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
    const { challengeId } = req.params;

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
