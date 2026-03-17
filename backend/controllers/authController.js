const bcrypt = require("bcrypt");
const passport = require("../config/passport");
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

    res.redirect("/login");
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).send("Server error during registration.");
  }
};

exports.showLoginPage = (req, res) => {
  res.render("login");
};

exports.loginUser = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/me",
    failureRedirect: "/login"
  })(req, res, next);
};

exports.logoutUser = (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      res.clearCookie("connect.sid");
      res.redirect("/login");
    });
  });
};

exports.showCurrentUser = (req, res) => {
  res.send(`
    <h1>Logged In User</h1>
    <p><strong>Email:</strong> ${req.user.email}</p>
    <p><strong>Role:</strong> ${req.user.role}</p>
    <form action="/logout" method="POST">
      <button type="submit">Logout</button>
    </form>
  `);
};