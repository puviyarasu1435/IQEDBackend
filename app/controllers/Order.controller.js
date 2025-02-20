const Order = require("../models/Ecart/Order.model"); // Assuming you have the Order model imported
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const S3 = require("../config/aws.config");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
async function generateSignedUrl(imageKey) {
  return await getSignedUrl(
    S3,
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imageKey,
    }),
    { expiresIn: 60 * 60 * 24 } // URL expires in 1 hour
  );
}
// Create a new order
const createOrder = async (req, res) => {
  try {
    const { Challenge, shippingAddress } = req.body;
    const userId = req._id;
    // Create a new order instance
    const newOrder = new Order({
      userId,
      Challenge,
      shippingAddress,
    });

    // Save the new order to the database
    await newOrder.save();

    return res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error while creating order" });
  }
};

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId Challenge"); // Populate product details
    const orderDetails = orders.map((order) => {
      const {
        _id,
        userId,
        shippingAddress,
        Challenge,
        orderStatus,
        createdAt,
      } = order;
      return {
        orderId: _id,
        customerName: userId.name,
        shippingAddress: `${shippingAddress.address}, ${shippingAddress.area}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.pincode}, ${shippingAddress.country}`,
        orderStatus: orderStatus,
        mobileNumber: shippingAddress.mobileNumber,
        challengeTitle: Challenge.title,
        OrderPlaced: createdAt,

        productDetails: {
          productId: Challenge._id,
          name: Challenge.productName,
          price: Challenge.eligibleGem,
          quantity: 1,
          sponsoreName: Challenge.sponsoreName,
          description: Challenge.description,
        },
      };
    });
    return res.status(200).json({
      message: "Orders retrieved successfully",
      orders: orderDetails,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error while fetching orders" });
  }
};

const getAllUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req._id }).populate("Challenge");

    const orderDetails = await Promise.all(
      orders.map(async (order) => {
        const {
          _id,
          userId,
          shippingAddress,
          Challenge,
          orderStatus,
          createdAt,
        } = order;

        const profileUrl = Challenge.banner
          ? await generateSignedUrl(Challenge.banner)
          : null;

        return {
          orderId: _id,
          customerName: userId.name,
          shippingAddress: `${shippingAddress.address} ${shippingAddress.area} ${shippingAddress.city} ${shippingAddress.state} ${shippingAddress.pincode}, ${shippingAddress.country}`,
          orderStatus: orderStatus,
          mobileNumber: shippingAddress.mobileNumber,
          challengeTitle: Challenge.title,
          OrderPlaced: createdAt,
          Image: profileUrl,
          productDetails: {
            productId: Challenge._id,
            name: Challenge.productName,
            price: Challenge.eligibleGem,
            quantity: 1,
            sponsoreName: Challenge.sponsoreName,
            description: Challenge.description,
          },
        };
      })
    );

    return res.status(200).json({
      message: "Orders retrieved successfully",
      orders: orderDetails,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error while fetching orders" });
  }
};

// Get an order by ID
const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id; // Get the order ID from the route parameters
    const order = await Order.findById(orderId).populate("Challenge");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: "Order retrieved successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error while fetching the order" });
  }
};

// Update an order by ID (specifically for updating order status)
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { orderStatus } = req.body; // Only update the status field
    console.log(orderId, orderStatus);
    // if (
    //   ![
    //     "Pending Order",
    //     "Order Placed",
    //     "Processing",
    //     "Shipped",
    //     "Out for Delivery",
    //     "Delivered",
    //     "Returned",
    //     "Cancelled",
    //     "Failed Delivery",
    //     "In Transit",
    //     "Awaiting Pickup",
    //     "Delayed",
    //     "On Hold",
    //     "Refunded",
    //     "Rescheduled",
    //   ].includes(orderStatus)
    // ) {
    //   return res.status(400).json({ message: "Invalid order status" });
    // }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.orderStatus = orderStatus;
    order.save();
    return res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error while updating order status" });
  }
};

// Delete an order by ID
const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error while deleting the order" });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getAllUserOrders,
};
