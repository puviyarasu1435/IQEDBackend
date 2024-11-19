const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IQScoreSchema = new Schema({
  Scores: [{
    type:Number,
    required: true,
}],
});

const IQScoreModel = mongoose.model('IQScore', IQScoreSchema);
module.exports = IQScoreModel;
