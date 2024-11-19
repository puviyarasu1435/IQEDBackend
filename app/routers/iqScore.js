const express = require("express");
const IQScoreModel = require("../models/IQScoreModel");

const router = express.Router();

// Route to push a value to the Scores array
router.post("/add-score", async (req, res) => {
  try {
    const { score } = req.body;
    if (typeof score !== "number") {
      return res.status(400).json({ message: "Score must be a number" });
    }

    // Find the document or create a new one if it doesn't exist
    let iqScores = await IQScoreModel.findOne();
    if (!iqScores) {
      iqScores = new IQScoreModel({ Scores: [] });
    }

    // Add the score to the Scores array
    iqScores.Scores.push(score);
    await iqScores.save();

    res.status(200).json({ message: "Score added successfully", scores: iqScores.Scores });
  } catch (error) {
    res.status(500).json({ message: "Error adding score", error: error.message });
  }
});

// Route to get all scores
router.get("/get-scores", async (req, res) => {
  try {
    const iqScores = await IQScoreModel.findOne();

    if (!iqScores || iqScores.Scores.length === 0) {
      return res.status(200).json({ message: "No scores found", scores: [] });
    }

    res.status(200).json({ scores: iqScores.Scores });
  } catch (error) {
    res.status(500).json({ message: "Error fetching scores", error: error.message });
  }
});

module.exports = router;
