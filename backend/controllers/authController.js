const bcrypt = require("bcrypt");
const User = require("../../database/models/User");

exports.showRegisterPage = (req, res) => {
  res.render("register");
};

exports.registerUser = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).send("All fields are required.");
    }

    if (!email.toLowerCase().endsWith("@uregina.ca")) {
      return res.status(400).send("You must register with a uregina.ca email.");
    }

    if (password !== confirmPassword) {
      return res.status(400).send("Passwords do not match.");
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).send("An account with this email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "student"
    });

    await newUser.save();

    //temporary response for testing, later res.redirect("/login")   
    res.send("Registration successful. Next step: redirect to login.");
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).send("Server error during registration.");
  }
};