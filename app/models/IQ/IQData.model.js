const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IQDataSchema = new Schema(
  {
    Scores: [
      {
        type: Number,
        required: true,
      },
    ],
    childrenScores: [
      {
        type: Number,
        required: true,
      },
    ],
    adolescentsScores: [
      {
        type: Number,
        required: true,
      },
    ],
    adultsScores: [
      {
        type: Number,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const IQModel = mongoose.model("IQData", IQDataSchema);
module.exports = IQModel;
