const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const IQUserSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  Iq: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "IQSession",
  },
  isComplated:{
    type:Boolean,
    default: false,
  }
});

const IQUserModel = mongoose.model("IQUser", IQUserSchema);
module.exports = IQUserModel;
