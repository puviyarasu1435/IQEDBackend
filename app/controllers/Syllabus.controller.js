const { default: mongoose } = require("mongoose");
const { CareerPath, Level, Lesson } = require("../models/Test/careerpath");

async function GetCareerLevels(req, res) {
  try {
    const CareerLevels = await CareerPath.findOne()
      .sort({ createdAt: -1 })
      .select("levels")
      .populate({
        path: "levels",
        populate: {
          path: "lessons",
        },
      });
    res.status(200).json({Levels:CareerLevels.levels,_id:CareerLevels._id});
  } catch (error) {
    console.error("Error fetching career paths:", error);
    res.status(500).json({ message: "Error fetching career paths", error });
  }
}

async function CreateNewLevel(req, res) {
  try {
    const { OldID, Leveldata } = req.body;
    console.log(req.body);
    const OldCareerPath = await CareerPath.findById(OldID).lean();
    
    if (!OldCareerPath) {
      return res
        .status(401)
        .json({ message: "not found old career path", error });
    }
    delete OldCareerPath._id;
    delete OldCareerPath.createdAt;
    delete OldCareerPath.updatedAt;
    const newCareerPath = new CareerPath(OldCareerPath);

    let newLevel = new Level({
      name: Leveldata.LevelName,
      description: Leveldata.description,
      levelNumber: newCareerPath.levels.length,
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
    newCareerPath.levels.push(newLevel._id);
    newCareerPath.save()
    res
      .status(201)
      .json({ message: "Bulk Career Paths inserted successfully!" });
  } catch (error) {
    console.error("Error fetching career paths:", error);
    res.status(500).json({ message: "Error fetching career paths", error });
  }
}

async function CreateEditLevel(req, res) {
  try {
    const { OldID, LevelID, Leveldata } = req.body;
    const newCareerPath = await CareerPath.findById(OldID).lean();
    if (!newCareerPath) {
      return res
        .status(401)
        .json({ message: "not found old career path", error });
    }

    // delete OldCareerPath._id;
    // const newCareerPath = new CareerPath(OldCareerPath);
    const oldlevel = await Level.findById(LevelID);
    if (!oldlevel) {
      return res.status(401).json({ message: "not found old level", error });
    }

    let newLevel = new Level({
      name: Leveldata.LevelName,
      description: Leveldata.description,
      levelNumber: oldlevel.levelNumber,
    });

    let lessonindex = 0;
    for (const lesson of Leveldata.lessons) {
      let newLesson = new Lesson({
        name: lesson.name,
        description: lesson.description,
        topics: lesson.topics.map(
          (topic) => new mongoose.Types.ObjectId(topic.$oid)
        ),
        lessonNumber: lessonindex,
      });
      await newLesson.save();
      newLevel.lessons.push(newLesson._id);
      lessonindex += 1;
    }
    await newLevel.save();
    newCareerPath.levels = newCareerPath.levels.map((id) =>
      id === oldlevel._id ? newLevel._id : id
    );
    newCareerPath.save();
    Level.findByIdAndDelete(oldlevel._id, (err, doc) => {
      if (err) {
        console.error('Error deleting document:', err);
      } else if (doc) {
        console.log('Document deleted:', doc);
      }
    });
    
    res
      .status(201)
      .json({ message: "Bulk Career Paths inserted successfully!" });
  } catch (error) {
    console.error("Error fetching career paths:", error);
    res.status(500).json({ message: "Error fetching career paths", error });
  }
}

module.exports = { GetCareerLevels, CreateEditLevel, CreateNewLevel };
