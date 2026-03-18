const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const passport = require("./config/passport");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/public")));
app.set("views", path.join(__dirname, "../frontend/views"));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/views"));

app.get("/", (req, res) => {
  res.send("UR Involved backend is running.");
});

app.use("/", authRoutes);

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