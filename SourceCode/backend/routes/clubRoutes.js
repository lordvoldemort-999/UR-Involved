const express = require("express");
const router = express.Router();
const clubController = require("../controllers/clubController");
const upload = require("../middleware/uploadMiddleware");

const {
  ensureAuthenticated,
  ensureStudent,
  ensureSystemAdmin
} = require("../middleware/authMiddleware");

router.get("/", clubController.showHomePage);
router.get("/partials/clubs", clubController.renderClubPartial);

router.get("/clubs/:id", clubController.showClubDetails);
router.get("/create-club", ensureAuthenticated, ensureStudent, clubController.showCreateClubPage);

router.get("/clubs/:id/join", ensureAuthenticated, ensureStudent, (req, res) => {
  const clubId = req.params.id;
  res.render("joinRequest", { clubId });
});

router.get("/dashboard", ensureAuthenticated, clubController.showDashboard);


// student actions
router.post("/clubs/:id/join", ensureAuthenticated, ensureStudent, clubController.submitJoinRequest);
router.post("/clubs/create-request", ensureAuthenticated, ensureStudent, upload.single("logo"), clubController.submitClubCreationRequest);

// system admin actions
router.get("/admin/club-requests", ensureAuthenticated, ensureSystemAdmin, clubController.showClubCreationRequests);
router.post("/admin/club-requests/:id/approve", ensureAuthenticated, ensureSystemAdmin, clubController.approveClubCreationRequest);
router.post("/admin/club-requests/:id/reject", ensureAuthenticated, ensureSystemAdmin, clubController.rejectClubCreationRequest);

// club owner/admin actions
router.get("/admin/clubs/:clubId/join-requests", ensureAuthenticated, clubController.showClubJoinRequests);
router.post("/admin/join-requests/:id/approve", ensureAuthenticated, clubController.approveJoinRequest);
router.post("/admin/join-requests/:id/reject", ensureAuthenticated, clubController.rejectJoinRequest);

module.exports = router;