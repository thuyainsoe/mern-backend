const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { dbConnect } = require("./utiles/db");
require("dotenv").config();

const app = express();

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json()); // Replaced bodyParser
app.use(cookieParser());

// Connect to the database
dbConnect();

// Routes
app.use("/api", require("./routes/authRoutes"));

app.get("/", (req, res) =>
  res.json({ message: "Hello from Express + Docker!" })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
