const mongoose = require('mongoose');

// Lesson Schema
const LessonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topics'}], // Reference to Topic model
});

// Unit Schema
const UnitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  lessons: [LessonSchema], 
});

// Course Schema
const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  units: [UnitSchema], 
});

const Course = mongoose.model('Course', CourseSchema);
module.exports = Course;
