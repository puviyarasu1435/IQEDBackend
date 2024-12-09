// Import required modules
const express = require("express");

const cors = require("cors");
const http = require("http");

const app = express();
const server = http.createServer(app);

require("dotenv").config();
require("./app/config/mogodb.config");
const {
  sessionMiddleware,
  sessionwrap,
} = require("./app/config/session.config");
const { jwt_isVerify } = require("./app/config/jwt.config");
const { CheckEarnings } = require("./app/middleware/User.middleware");

const SocketConnection = require("./app/scokets/socket");

// Routers
const AppRoute = require("./app/routes/App.routes");
const AuthRoute = require("./app/routes/Auth.routes");
const UserRoute = require("./app/routes/User.routes");
const QuizRoute = require("./app/routes/Quiz.routes");
const IQRoute = require("./app/routes/IQ.routes");
const CareerRoute = require("./app/routes/Career.routes");
const GameRoute = require("./app/routes/Game.routes");

const { main } = require("./app/Stream/User.Stream");

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // React frontend
    methods: ["GET", "POST","PUT"],
    credentials: true, // Allow sending cookies
  })
);
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(sessionMiddleware);



// Environment variables
const PORT = process.env.PORT || 5000;

// Route connections
app.use("/", AppRoute);
app.use("/auth", AuthRoute);
app.use("/career", CareerRoute);
app.use("/user", jwt_isVerify, CheckEarnings, UserRoute);
app.use("/quiz", jwt_isVerify, CheckEarnings, QuizRoute);
app.use("/game", GameRoute);
app.use("/IQ", IQRoute);

//sockets
SocketConnection(server)

main().catch((err) => console.error(err));

// Start the server
server.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
