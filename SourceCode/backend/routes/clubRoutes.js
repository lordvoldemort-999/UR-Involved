const express = require("express");
const router = express.Router();
const clubController = require("../controllers/clubController");

router.get("/", clubController.showHomePage);
router.get("/clubs/:id", clubController.showClubDetails);

module.exports = router;