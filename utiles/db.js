const mongoose = require("mongoose");

module.exports.dbConnect = async () => {
  try {
    // In Mongoose 6+, the connection options are no longer needed
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected successfully. ✅");
  } catch (error) {
    console.error("Database connection failed: ❌", error);
    // Exit the process with failure
    process.exit(1);
  }
};
