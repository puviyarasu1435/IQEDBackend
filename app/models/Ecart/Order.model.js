const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    Challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },
    quantity: { type: Number, default:1 },
    orderStatus: {
      type: String,
      default: "Pending",
    },
    shippingAddress: {    
      type: mongoose.Schema.Types.Mixed, 
      required: true,
    }
  },
  {
    timestamps: {
      currentTime:() => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000)
    },
  }
);

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
