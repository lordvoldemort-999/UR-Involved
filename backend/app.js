const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/public")));

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/views"));

// Temporary home route for testing
app.get("/", (req, res) => {
  res.send("UR Involved backend is running.");
});

// Auth routes
app.use("/", authRoutes);

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/ur_involved")
  .then(() => {
    console.log("MongoDB connected successfully.");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });