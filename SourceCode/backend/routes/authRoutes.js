const express = require("express");
const router = express.Router();
const { ensureSystemAdmin } = require("../middleware/authMiddleware");

const authController = require("../controllers/authController");
const { ensureAuthenticated } = require("../middleware/authMiddleware"); //used to protect routes so only logged-in users can access them.
const profileUpload = require("../middleware/profileUploadMiddleware");

router.get("/register", authController.showRegisterPage);
router.post("/register", profileUpload.single("profileImage"), authController.registerUser);

router.get("/login", authController.showLoginPage);
router.post("/login", authController.loginUser);

router.post("/logout", authController.logoutUser);

router.get("/me", ensureAuthenticated, authController.showCurrentUser);
router.post("/account/delete", ensureAuthenticated, authController.deleteAccount);

router.post(
  "/profile/upload",
  ensureAuthenticated,
  profileUpload.single("profileImage"),
  authController.updateProfileImage
);

router.post("/admin/users/:id/delete", ensureAuthenticated, ensureSystemAdmin, authController.deleteUserByAdmin);

module.exports = router;