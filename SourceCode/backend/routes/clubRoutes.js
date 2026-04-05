const express = require("express");
const router = express.Router();

const clubController = require("../controllers/clubController");

const {
  ensureAuthenticated,
  ensureStudent,
  ensureSystemAdmin
} = require("../middleware/authMiddleware");

// ================= HOME =================
router.get("/", clubController.showHomePage);

// ================= CLUB DETAILS =================
router.get("/clubs/:id", clubController.showClubDetails);

// ================= JOIN PAGE =================
router.get("/clubs/:id/join", ensureAuthenticated, (req, res) => {
  const clubId = req.params.id;
  res.render("joinRequest", { clubId });
});

// ================= DASHBOARD =================
router.get("/dashboard", ensureAuthenticated, clubController.showDashboard);

// ================= STUDENT ACTIONS =================
router.post(
  "/clubs/:id/join-request",
  ensureAuthenticated,
  ensureStudent,
  clubController.submitJoinRequest
);

router.post(
  "/clubs/create-request",
  ensureAuthenticated,
  ensureStudent,
  clubController.submitClubCreationRequest
);

// ================= SYSTEM ADMIN =================
router.get(
  "/admin/club-requests",
  ensureAuthenticated,
  ensureSystemAdmin,
  clubController.showClubCreationRequests
);

router.post(
  "/admin/club-requests/:id/approve",
  ensureAuthenticated,
  ensureSystemAdmin,
  clubController.approveClubCreationRequest
);

router.post(
  "/admin/club-requests/:id/reject",
  ensureAuthenticated,
  ensureSystemAdmin,
  clubController.rejectClubCreationRequest
);

// ================= CLUB OWNER / ADMIN =================
router.get(
  "/admin/clubs/:clubId/join-requests",
  ensureAuthenticated,
  clubController.showClubJoinRequests
);

router.post(
  "/admin/join-requests/:id/approve",
  ensureAuthenticated,
  clubController.approveJoinRequest
);

router.post(
  "/admin/join-requests/:id/reject",
  ensureAuthenticated,
  clubController.rejectJoinRequest
);

module.exports = router;