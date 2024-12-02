const { TopicModel } = require("../models");

async function postTopicsInBulk(req, res) {
  try {
    // Validate that the request body is an array
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ message: "Input must be an array of topics." });
    }

    // Insert multiple documents in one operation
    const savedTopics = await TopicModel.insertMany(req.body, { ordered: false });

    res
      .status(200)
      .json({ message: "Topics created successfully", data: savedTopics });
  } catch (error) {
    console.error("Error creating topics in bulk:", error);

    if (error.name === "ValidationError" || error.name === "MongoError") {
      return res
        .status(400)
        .json({ message: "Error creating some topics", error: error.message });
    }

    res.status(500).send("An error occurred. Please try again.");
  }
}

async function getAllTopics(req, res) {
  try {
    const topics = await TopicModel.find();
    res
      .status(200)
      .json({ message: "Topics fetched successfully", data: topics });
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).send("An error occurred. Please try again.");
  }
}

async function getTopicById(req, res) {
  try {
    const topic = await TopicModel.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: "Topic not found" });
    res
      .status(200)
      .json({ message: "Topic fetched successfully", data: topic });
  } catch (error) {
    console.error("Error fetching topic:", error);
    res.status(500).send("An error occurred. Please try again.");
  }
}

async function updateTopic(req, res) {
  try {
    const updatedTopic = await TopicModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedTopic)
      return res.status(404).json({ message: "Topic not found" });
    res
      .status(200)
      .json({ message: "Topic updated successfully", data: updatedTopic });
  } catch (error) {
    console.error("Error updating topic:", error);
    res.status(500).send("An error occurred. Please try again.");
  }
}

async function deleteTopic(req, res) {
  try {
    const deletedTopic = await TopicModel.findByIdAndDelete(req.params.id);
    if (!deletedTopic)
      return res.status(404).json({ message: "Topic not found" });
    res.status(200).json({ message: "Topic deleted successfully" });
  } catch (error) {
    console.error("Error deleting topic:", error);
    res.status(500).send("An error occurred. Please try again.");
  }
}

module.exports = {
  postTopicsInBulk,
  getAllTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
};
