const { default: mongoose } = require("mongoose");
const { CareerPath, Level, Lesson } = require("../models/Test/careerpath");

async function GetCareerLevels(req, res) {
  try {
    const CareerLevels = await CareerPath.findOne({ status: "live" })
      .sort({ createdAt: -1 })
      .select("levels")
      .populate({
        path: "levels",
        populate: {
          path: "lessons",
          populate: {
            path: "topics",
          },
        },
      });
    res.status(200).json({Levels:CareerLevels.levels,_id:CareerLevels._id});
  } catch (error) {
    console.error("Error fetching career paths:", error);
    res.status(500).json({ message: "Error fetching career paths", error });
  }
}
async function GetCareerDraftLevels(req, res) {
  try {
    let CareerLevels = await CareerPath.findOne({ status: "draft" })
      .sort({ createdAt: -1 }) 
      .select("levels")
      .populate({
        path: "levels",
        populate: {
          path: "lessons",
        },
      });
    if (!CareerLevels) {
      const newCareerPath = new CareerPath({
        name: "New Draft Career Path",
        description: "This is a newly created draft career path.",
        levels: [],
        status: "draft",
      });

      CareerLevels = await newCareerPath.save();
    }

    res.status(200).json({ Levels: CareerLevels.levels, _id: CareerLevels._id });
  } catch (error) {
    console.error("Error fetching or creating draft career path:", error);
    res.status(500).json({ message: "Error fetching or creating career path", error });
  }
}


async function CreateNewLevel(req, res) {
  try {
    const { DraftID, Leveldata } = req.body;
    console.log(req.body);
    const DraftCareerPath = await CareerPath.findById(DraftID);

    let newLevel = new Level({
      name: Leveldata.LevelName,
      description: Leveldata.description,
      levelNumber: DraftCareerPath.levels.length,
    });

    let lessonindex = 0;
    for (const lesson of Leveldata.Lession) {
      let newLesson = new Lesson({
        name: lesson.name,
        description: lesson.description,
        topics: lesson.topics,
        lessonNumber: lessonindex,
      });
      await newLesson.save();
      newLevel.lessons.push(newLesson._id);
      lessonindex += 1;
    }
    await newLevel.save();
    DraftCareerPath.levels.push(newLevel._id);
    DraftCareerPath.save()
    res
      .status(201)
      .json({ message: "Bulk Career Paths inserted successfully!" });
  } catch (error) {
    console.error("Error fetching career paths:", error);
    res.status(500).json({ message: "Error fetching career paths", error });
  }
}


async function deleteLevelById(req, res) {
  try {
    const {DraftID, levelId } = req.body;
    const DraftCareerPath = await CareerPath.findById(DraftID);
    const level = await Level.findById(levelId);
    if (!level) {
      return res.status(404).json({ message: "Level not found." });
    }
    const lessons = await Lesson.find({ _id: { $in: level.lessons } });
    if (lessons.length > 0) {
      await Lesson.deleteMany({ _id: { $in: level.lessons } });
    }
    await Level.findByIdAndDelete(levelId);
    DraftCareerPath.levels.pop(levelId);
    DraftCareerPath.save();
    res.json({
      message: "Level, Lessons, and Topics deleted successfully",
      deletedLessons: level.lessons,
      deletedLevel: levelId,
    });
  } catch (error) {
    console.error("Error deleting Level, Lessons, and Topics:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
  }

async function CreateEditLevel(req, res) {
  try {
    const { LevelID, Leveldata } = req.body;

    const level = await Level.findById(LevelID);
    if (!level) {
      return res.status(401).json({ message: "not found  lesson", error });
    }
    level.name = Leveldata.name;
    level.description = Leveldata.description;
    level.save();

    for (const lesson of Leveldata.lessons){
      const lessonD = await Level.findById(lesson._id);
      if (!lessonD) {
        continue;
      }
      lessonD.name = lesson.name;
      lessonD.description = lesson.description;
      lessonD.save()
    }
    res
      .status(200)
      .json({ message: "Update titles successfully!" });
  } catch (error) {
    console.error("Error fetching career paths:", error);
    res.status(500).json({ message: "Error fetching career paths", error });
  }
}

async function EditLevelOrder(req, res) {
  try {
    const { DraftID, Levels } = req.body;
    const DraftCareerPath = await CareerPath.findById(DraftID);
    if (!DraftCareerPath) {
      return res.status(401).json({ message: "not found  lesson", error });
    }
    DraftCareerPath.levels = Levels;
    DraftCareerPath.save();
    res
      .status(200)
      .json({ message: "Update titles successfully!" });
  } catch (error) {
    console.error("Error fetching career paths:", error);
    res.status(500).json({ message: "Error fetching career paths", error });
  }
}


async function PublishCareer(req, res) {
  try {
    const { DraftID } = req.body;
    const DraftCareerPath = await CareerPath.findById(DraftID);
    delete DraftCareerPath._id;
    delete DraftCareerPath.createdAt;
    delete DraftCareerPath.updatedAt;

    const newCareerPath = new CareerPath();
    newCareerPath.name = DraftCareerPath.name
    newCareerPath.description = DraftCareerPath.description
    newCareerPath.levels = DraftCareerPath.levels;
    newCareerPath.status="live";
    newCareerPath.save();
    res
      .status(201)
      .json({ message: "Bulk Career Paths inserted successfully!" });
  } catch (error) {
    console.error("Error fetching career paths:", error);
    res.status(500).json({ message: "Error fetching career paths", error });
  }
}
module.exports = { GetCareerDraftLevels,GetCareerLevels,deleteLevelById, CreateEditLevel, CreateNewLevel,PublishCareer,EditLevelOrder };
