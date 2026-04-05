const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { ensureAuthenticated } = require("../middleware/authMiddleware");

router.get("/register", authController.showRegisterPage);
router.post("/register", authController.registerUser);

router.get("/login", authController.showLoginPage);
router.post("/login", authController.loginUser);

router.post("/logout", authController.logoutUser);

router.get("/dashboard", ensureAuthenticated, authController.showDashboard);

router.get("/me", ensureAuthenticated, authController.showCurrentUser);

module.exports = router;