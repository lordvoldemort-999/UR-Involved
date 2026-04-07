const Club = require("../../database/models/Club");
const JoinRequest = require("../../database/models/JoinRequest");
const ClubCreationRequest = require("../../database/models/ClubCreationRequest");

exports.showHomePage = async (req, res) => {
  try {
    const { clubs, search, sort, filter } = await getClubsData(req.query);

    res.render("home", { 
      clubs,
      currentSearch: search,
      currentSort: sort,
      currentFilter: filter
    });

  } catch (error) {
    console.error("failure rendering home page", error);
    res.status(500).send("Error loading homepage.");
  }
};

// used to update club list on homepage without a full page reload
exports.renderClubPartial = async (req, res) => {
  try {
    const { clubs } = await getClubsData(req.query);
    res.render("partials/clubList", { clubs }); 

  } catch (error) {
    console.error("Error rendering club partial", error);
    res.status(500).send("<p>Error loading clubs. Please try again.</p>");
  }
};


// Helper to build the MongoDB query and sort options based on request parameters
const getClubsData = async (reqQuery) => {
  const search = reqQuery.search || "";
  const sort = reqQuery.sort || "alphabetical";
  const filter = reqQuery.filter || "All";

  let query = { approved: true };

  // Search across Name, Category, and Description
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  // Apply category filter if it's not "All"
  if (filter !== "All") {
    query.category = filter;
  }

  // Define sorting logic
  let sortOptions = {};
  if (sort === "alphabetical") sortOptions = { name: 1 };
  else if (sort === "reverseAlphabetical") sortOptions = { name: -1 };
  else if (sort === "newest") sortOptions = { createdAt: -1 };
  else if (sort === "oldest") sortOptions = { createdAt: 1 };

  const clubs = await Club.find(query).sort(sortOptions);

  return { clubs, search, sort, filter };
};

exports.showClubDetails = async (req, res) => {
  try {
    const club = await Club.findOne({
      _id: req.params.id,
      approved: true
    });

    if (!club) {
      return res.status(404).send("Club not found.");
    }

    let existingJoinRequest = null;

    if (req.user && req.user.role === "student") {
      existingJoinRequest = await JoinRequest.findOne({
        student: req.user._id,
        club: club._id
      });
    }

    res.render("clubDetail", {
      club,
      existingJoinRequest
    });
  } catch (error) {
    console.error("failure rendering club details page", error);
    res.status(500).send("Error loading club details page.");
  }
};

exports.showDashboard = async (req, res) => {
  try {
    const userJoinRequests = await JoinRequest.find({
      student: req.user._id
    }).populate("club");

    const userClubCreationRequests = await ClubCreationRequest.find({
      requestedBy: req.user._id
    });

    const memberClubs = await Club.find({
      members: req.user._id
    });

    const adminClubs = await Club.find({
      $or: [
        { createdBy: req.user._id },
        { admins: req.user._id }
      ]
    });

    res.render("dashboard", {
      user: req.user,
      userJoinRequests,
      userClubCreationRequests,
      memberClubs,
      adminClubs
    });
  } catch (error) {
    console.error("failure rendering dashboard", error);
    res.status(500).send("Error loading dashboard.");
  }
};

exports.submitJoinRequest = async (req, res) => {
  try {
    const club = await Club.findOne({
      _id: req.params.id,
      approved: true
    });

    if (!club) {
      return res.status(404).send("Club not found.");
    }

    const alreadyMember = club.members.some(
      memberId => memberId.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).send("You are already a member of this club.");
    }

    const existingRequest = await JoinRequest.findOne({
      student: req.user._id,
      club: club._id,
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).send("You already have a pending join request for this club.");
    }

    const joinRequest = new JoinRequest({
      student: req.user._id,
      club: club._id,
      message: req.body.message || ""
    });

    await joinRequest.save();

    res.redirect(`/clubs/${club._id}`);
  } catch (error) {
    console.error("error submitting join request", error);
    res.status(500).send("Error submitting join request.");
  }
};

exports.submitClubCreationRequest = async (req, res) => {
  try {
    const { proposedName, description, category, contactEmail } = req.body;

    const request = new ClubCreationRequest({
      requestedBy: req.user._id,
      proposedName,
      description,
      category,
      contactEmail
    });

    await request.save();

    res.redirect("/dashboard");
  } catch (error) {
    console.error("error submitting club creation request", error);
    res.status(500).send("Error submitting club creation request.");
  }
};

exports.showClubCreationRequests = async (req, res) => {
  try {
    const requests = await ClubCreationRequest.find()
      .populate("requestedBy")
      .sort({ createdAt: -1 });

    res.render("adminClubRequests", { requests });
  } catch (error) {
    console.error("error loading club creation requests", error);
    res.status(500).send("Error loading club requests.");
  }
};

exports.approveClubCreationRequest = async (req, res) => {
  try {
    const request = await ClubCreationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).send("Club creation request not found.");
    }

    if (request.status !== "pending") {
      return res.status(400).send("This request has already been processed.");
    }

    const newClub = new Club({
      name: request.proposedName,
      description: request.description,
      category: request.category,
      contactEmail: request.contactEmail,
      approved: true,
      createdBy: request.requestedBy,
      admins: [request.requestedBy],
      members: [request.requestedBy]
    });

    await newClub.save();

    request.status = "approved";
    await request.save();

    res.redirect("/admin/club-requests");
  } catch (error) {
    console.error("error approving club creation request", error);
    res.status(500).send("Error approving club request.");
  }
};

exports.rejectClubCreationRequest = async (req, res) => {
  try {
    const request = await ClubCreationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).send("Club creation request not found.");
    }

    request.status = "rejected";
    await request.save();

    res.redirect("/admin/club-requests");
  } catch (error) {
    console.error("error rejecting club creation request", error);
    res.status(500).send("Error rejecting club request.");
  }
};

exports.showClubJoinRequests = async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);

    if (!club) {
      return res.status(404).send("Club not found.");
    }

    const isOwner =
      club.createdBy && club.createdBy.toString() === req.user._id.toString();

    const isAdmin =
      club.admins &&
      club.admins.some(adminId => adminId.toString() === req.user._id.toString());

    const isSystemAdmin = req.user.role === "systemAdmin";

    if (!isOwner && !isAdmin && !isSystemAdmin) {
      return res.status(403).send("You cannot view join requests for this club.");
    }

    const joinRequests = await JoinRequest.find({
      club: club._id
    }).populate("student");

    res.render("adminJoinRequests", {
      club,
      joinRequests
    });
  } catch (error) {
    console.error("error loading join requests", error);
    res.status(500).send("Error loading join requests.");
  }
};

exports.approveJoinRequest = async (req, res) => {
  try {
    const joinRequest = await JoinRequest.findById(req.params.id).populate("club");

    if (!joinRequest) {
      return res.status(404).send("Join request not found.");
    }

    const club = await Club.findById(joinRequest.club._id);

    const isOwner =
      club.createdBy && club.createdBy.toString() === req.user._id.toString();

    const isAdmin =
      club.admins &&
      club.admins.some(adminId => adminId.toString() === req.user._id.toString());

    const isSystemAdmin = req.user.role === "systemAdmin";

    if (!isOwner && !isAdmin && !isSystemAdmin) {
      return res.status(403).send("You cannot approve this join request.");
    }

    joinRequest.status = "approved";
    await joinRequest.save();

    const alreadyMember = club.members.some(
      memberId => memberId.toString() === joinRequest.student.toString()
    );

    if (!alreadyMember) {
      club.members.push(joinRequest.student);
      await club.save();
    }

    res.redirect(`/admin/clubs/${club._id}/join-requests`);
  } catch (error) {
    console.error("error approving join request", error);
    res.status(500).send("Error approving join request.");
  }
};

exports.rejectJoinRequest = async (req, res) => {
  try {
    const joinRequest = await JoinRequest.findById(req.params.id).populate("club");

    if (!joinRequest) {
      return res.status(404).send("Join request not found.");
    }

    const club = await Club.findById(joinRequest.club._id);

    const isOwner =
      club.createdBy && club.createdBy.toString() === req.user._id.toString();

    const isAdmin =
      club.admins &&
      club.admins.some(adminId => adminId.toString() === req.user._id.toString());

    const isSystemAdmin = req.user.role === "systemAdmin";

    if (!isOwner && !isAdmin && !isSystemAdmin) {
      return res.status(403).send("You cannot reject this join request.");
    }

    joinRequest.status = "rejected";
    await joinRequest.save();

    res.redirect(`/admin/clubs/${club._id}/join-requests`);
  } catch (error) {
    console.error("error rejecting join request", error);
    res.status(500).send("Error rejecting join request.");
  }
};