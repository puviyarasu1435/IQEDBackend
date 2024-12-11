const session = require("express-session");
const MongoStore = require("connect-mongo");

const TTL = 30 * (60 *1000);

// Express session middleware configuration
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "your-secret-key", // Fallback if env variable is missing
  resave: false,
  saveUninitialized: false,
  credentials: true, // Allow credentials to be used
  cookie: {
    httpOnly: true, // Prevents JS access to cookies // Set `true` if HTTPS is used
    maxAge: TTL,
    secure: true,
   // 1 hour in milliseconds
  },
  store: MongoStore.create({
    mongoUrl: process.env.Mongodb_URL, // MongoDB connection string
    collectionName: "sessions", // Name of the collection in MongoDB
    ttl: TTL, // Session time-to-live in seconds (1 hour)
  }),
});



module.exports = { sessionMiddleware };
