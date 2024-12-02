
const QuestModel = require("../models/Quest/Quest.model");



const createQuest = async (req, res) => {
    const { title, description, type, params, reward } = req.body;
  
    try {
      const newQuest = new QuestModel({
        title,
        description,
        type,
        params,
        reward,
      });
      await newQuest.save();
      return res.status(201).json({ message: "Quest created!", newQuest });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: error.message });
    }
  }


module.exports = {createQuest};