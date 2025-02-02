const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Product Schema
const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String },
    stockQuantity: { type: Number, default: 0 },
  },
  {
    timestamps: {
      currentTime:() => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000)
    },
  }
);

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
