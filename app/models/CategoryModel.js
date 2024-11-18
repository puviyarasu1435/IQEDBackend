const mongoose = require("mongoose");
const QuizModel = require("./QuizModel");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  }
});

const CategoryModel = mongoose.model('Category', CategorySchema);
module.exports = CategoryModel;
