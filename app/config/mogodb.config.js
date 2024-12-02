const mongoose = require("mongoose");

mongoose.connect(process.env.Mongodb_URL, {})
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((e) => {
    console.log("MongoDB Connection Failed: " + e);
});
