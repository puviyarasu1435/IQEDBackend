const express = require('express');
const Course = require('../models/Career/Course.model');

// Create a new course
async function newCourse(req, res) {
    const { name, description, units } = req.body;
    try {
      const course = new Course({ name, description, units });
      await course.save();
      res.status(201).json({ message: 'Course created successfully', course });
    } catch (error) {
      console.error('Error creating course:', error);  // Log the full error to the console
      res.status(500).json({ message: 'Error creating course', error: error.message || error });
    }
  }

// Get all courses
async function GetCourse(req, res){
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error });
  }
}

// Get course by ID
async function GetCourseById(req, res) {
    try {
      const course = await Course.findById(req.params.id)
        .populate({
          path: 'units.lessons.topics',  // Populate topics inside lessons inside units
        });
  
      if (!course) return res.status(404).json({ message: 'Course not found' });
      
      res.status(200).json(course);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching course', error });
    }
  }
  
  

module.exports = {newCourse,GetCourse,GetCourseById};
