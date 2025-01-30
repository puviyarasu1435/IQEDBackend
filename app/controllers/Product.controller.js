const Product = require("../models/Ecart/Product.model"); // Assuming you have the Product model imported

// Create a new product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stockQuantity } =
      req.body;

    // Create a new product instance
    const newProduct = new Product({
      name,
      description,
      price:Math.floor(price),
      category,
      image,
      stockQuantity,
    });

    // Save the new product to the database
    await newProduct.save();

    return res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error while creating product" });
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json({
      message: "Products retrieved successfully",
      products,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error while fetching products" });
  }
};

// Get a product by ID
const getProductById = async (req, res) => {
  try {
    const productId = req.params.id; // Get the product ID from the route parameters
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product retrieved  By ID successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error while fetching the product" });
  }
};

// Update a product by ID
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedData = req.body;

    const product = await Product.findByIdAndUpdate(productId, updatedData, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error while updating the product" });
  }
};

// Delete a product by ID
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error while deleting the product" });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
