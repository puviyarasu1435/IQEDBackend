const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpSchema = Schema({
    email: { type: String, required: true },
    otp: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now, index: { expires: '1m' } }, // TTL index: expires after 1 minute
});



const OTPModel = mongoose.model("otp", otpSchema);
module.exports = OTPModel;