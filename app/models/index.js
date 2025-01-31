const UserModel = require("./User/User.model");
const TopicModel = require("./Career/Topic.model");
const QuestionModel = require("./Career/Question.model");
const QuizSessionModel = require("./Quiz/QuizSession.model");
const GameSessionModel = require("./Game/GameSession.model");
const IQQuestionModel = require("./IQ/IQQuestion.model");
const IQSessionModel = require("./IQ/IQSession.model");
const IQModel = require("./IQ/IQData.model");
module.exports = {
  UserModel,
  TopicModel,
  QuestionModel,
  QuizSessionModel,
  GameSessionModel,
  IQQuestionModel,
  IQSessionModel,
  IQModel
};