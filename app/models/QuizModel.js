const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    type: {
      type: String,
      enum: ['text-text', 'text-image', 'image-image'],
      required: true,
    },
    question: {
      type: String,
      required: true
    },
    questionImage: {
      type: String,
      required: function() { return this.type === 'text-image'; }
    },
    options: [
      {
        type: {
          type: String,
          enum: ['text', 'image'],
          required: true,
        },
        content: {
          type: String, 
          required: true,
        }
      }
    ],
    correctAnswer: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      }
    ],
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    }
  });
  

  QuestionSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
  });

  const QuizModel = mongoose.model('Question', QuestionSchema);
  module.exports = QuizModel;