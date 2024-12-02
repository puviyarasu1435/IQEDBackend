const { SectionModel } = require("../models");

async function postSection(req, res) {
  try {
    const Section = new SectionModel(req.body);
    const savedSection = await Section.save();
    res
      .status(200)
      .json({ message: "Section created successfully", data: savedSection });
  } catch (error) {
    console.error("Error creating Section:", error);
    res.status(500).send("An error occurred. Please try again.");
  }
}

async function getAllSections(req, res) {
  try {
    const Section = await SectionModel.find();
    res
      .status(200)
      .json(Section);
  } catch (error) {
    console.error("Error fetching Sections:", error);
    res.status(500).send("An error occurred. Please try again.");
  }
}

async function getSectionById(req, res) {
  try {
    const Section = await SectionModel.findById(req.params.id).populate(
      "topics"
    );
    if (!Section) return res.status(404).json({ message: "Section not found" });
    res
      .status(200)
      .json({ message: "Section fetched successfully", data: Section });
  } catch (error) {
    console.error("Error fetching Section:", error);
    res.status(500).send("An error occurred. Please try again.");
  }
}

async function updateSection(req, res) {
  try {
    const updatedSection = await SectionModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedSection)
      return res.status(404).json({ message: "Section not found" });
    res
      .status(200)
      .json({ message: "Section updated successfully", data: updatedSection });
  } catch (error) {
    console.error("Error updating Section:", error);
    res.status(500).send("An error occurred. Please try again.");
  }
}

async function deleteSection(req, res) {
  try {
    const deletedSection = await SectionModel.findByIdAndDelete(req.params.id);
    if (!deletedSection)
      return res.status(404).json({ message: "Section not found" });
    res.status(200).json({ message: "Section deleted successfully" });
  } catch (error) {
    console.error("Error deleting Section:", error);
    res.status(500).send("An error occurred. Please try again.");
  }
}

async function getAll(req, res) {
  try {
    const SectionList = await SectionModel.find().populate({
      path: "lesson", // Populate the 'lesson' field
      populate: {
        path: "topics", // Populate the 'topics' field inside each lesson
      },
    });
    res
      .status(200)
      .json(SectionList);
  } catch (error) {
    console.error("Error fetching lessons by section:", error);
    res.status(500).send("An error occurred. Please try again....");
  }
}

module.exports = {
  postSection,
  getAllSections,
  getSectionById,
  updateSection,
  deleteSection,
  getAll,
};
