const bcrypt = require("bcrypt");
const passport = require("../config/passport");
const User = require("../../database/models/User");
const Club = require("../../database/models/Club");
const JoinRequest = require("../../database/models/JoinRequest");
const ClubCreationRequest = require("../../database/models/ClubCreationRequest");

exports.deleteUserByAdmin = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).send("User not found.");
    }

    if (userToDelete.role === "systemAdmin") {
      return res.status(403).send("System admin accounts cannot be deleted here.");
    }

    const createdClub = await Club.findOne({ createdBy: userToDelete._id });
    if (createdClub) {
      return res.status(400).send("Cannot delete a user who is the creator of a club.");
    }

    await JoinRequest.deleteMany({ student: userToDelete._id });
    await ClubCreationRequest.deleteMany({ requestedBy: userToDelete._id });

    await Club.updateMany(
      {},
      {
        $pull: {
          members: userToDelete._id,
          admins: userToDelete._id
        }
      }
    );

    await User.findByIdAndDelete(userToDelete._id);

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).send("Error deleting user.");
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).send("Not logged in.");
    }

    if (req.user.role === "systemAdmin") {
      return res.status(403).send("System admin accounts cannot be deleted here.");
    }

    const createdClub = await Club.findOne({ createdBy: req.user._id });
    if (createdClub) {
      return res.status(400).send("You cannot delete your account while you are the creator of a club.");
    }

    await JoinRequest.deleteMany({ student: req.user._id });
    await ClubCreationRequest.deleteMany({ requestedBy: req.user._id });
    await Club.updateMany(
      {},
      {
        $pull: {
          members: req.user._id,
          admins: req.user._id
        }
      }
    );

    await User.findByIdAndDelete(req.user._id);

    req.logout((error) => {
      if (error) return next(error);

      req.session.destroy((sessionError) => {
        if (sessionError) return next(sessionError);

        res.clearCookie("connect.sid");
        res.redirect("/register");
      });
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).send("Error deleting account.");
  }
};

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

    const profileImagePath = req.file
    ? `/images/profile-pictures/${req.file.filename}`
    : "/images/University_of_Regina_Logo.jpg";

    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "student",
      profilePicture: profileImagePath
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
    successRedirect: "/",
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
  if (!req.user) {
    return res.status(401).send("Not logged in.");
  }

  res.send(`
    <h1>Logged In User</h1>
    <p><strong>Email:</strong> ${req.user.email}</p>
    <p><strong>Role:</strong> ${req.user.role}</p>
    <form action="/logout" method="POST">
      <button type="submit">Logout</button>
    </form>
  `);
};

exports.updateProfileImage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send("Not logged in.");
    }

    if (!req.file) {
      return res.status(400).send("Please choose an image.");
    }

    const profilePicturePath = `/images/profile-pictures/${req.file.filename}`;

    await User.findByIdAndUpdate(req.user._id, {
      profilePicture: profilePicturePath
    });

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Profile image update error:", error);
    res.status(500).send("Error updating profile image.");
  }
};
