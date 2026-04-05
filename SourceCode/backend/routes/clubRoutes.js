const express = require("express");
const router = express.Router();

const clubController = require("../controllers/clubController");
const { ensureAuthenticated } = require("../middleware/authMiddleware");


const {
  ensureAuthenticated,
  ensureStudent,
  ensureSystemAdmin
} = require("../middleware/authMiddleware");

router.get("/", clubController.showHomePage);

router.get("/clubs/:id", clubController.showClubDetails);

<<<<<<< HEAD
router.get("/dashboard", ensureAuthenticated, clubController.showDashboard);

// student actions
router.post("/clubs/:id/join-request", ensureAuthenticated, ensureStudent, clubController.submitJoinRequest);
router.post("/clubs/create-request", ensureAuthenticated, ensureStudent, clubController.submitClubCreationRequest);

// system admin actions
router.get("/admin/club-requests", ensureAuthenticated, ensureSystemAdmin, clubController.showClubCreationRequests);
router.post("/admin/club-requests/:id/approve", ensureAuthenticated, ensureSystemAdmin, clubController.approveClubCreationRequest);
router.post("/admin/club-requests/:id/reject", ensureAuthenticated, ensureSystemAdmin, clubController.rejectClubCreationRequest);

// club owner/admin actions
router.get("/admin/clubs/:clubId/join-requests", ensureAuthenticated, clubController.showClubJoinRequests);
router.post("/admin/join-requests/:id/approve", ensureAuthenticated, clubController.approveJoinRequest);
router.post("/admin/join-requests/:id/reject", ensureAuthenticated, clubController.rejectJoinRequest);
=======

router.get("/clubs/:id/join", ensureAuthenticated, (req, res) => {
  const clubId = req.params.id;

  res.render("joinRequest", { 
    clubId 
  });
});


router.post("/clubs/:id/join", ensureAuthenticated, async (req, res) => {
  try {
    const clubId = req.params.id;
    const message = req.body.message; // 👈 gets textarea input

    console.log("Join request submitted:");
    console.log("Club ID:", clubId);
    console.log("Message:", message);


    res.redirect(`/clubs/${clubId}?joined=true`);

  } catch (error) {
    console.error("Join request error:", error);
    res.redirect(`/clubs/${req.params.id}`);
  }
});
>>>>>>> c426963 (Finished club details page with join and contact features)

module.exports = router;