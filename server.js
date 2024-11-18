// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const http = require("http");

// Import routes
const auth = require("./app/routers/Auth/Auth");
const Quiz = require("./app/routers/Quiz/Quiz");

// Configure the app
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Route connections
app.use("/Auth", auth);
app.use("/Quiz", Quiz);

app.get("/", (req, res) => {
  res.send("Server is running.");
});

// MongoDB connection
mongoose
  .connect(process.env.Mongodb_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected");
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((e) => {
    console.log("MongoDB Connection Failed: " + e);
  });

// Import Socket.IO setup and pass the server

// require("./app/routers/Match/Match.js")(server);
