const Club = require("../../database/models/Club");
const JoinRequest = require("../../database/models/JoinRequest");
const ClubCreationRequest = require("../../database/models/ClubCreationRequest");
const mongoose = require("mongoose");
const User = require("../../database/models/User");

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

exports.showEditProfile = async (req, res) => {
  res.render("editProfile", { user: req.user });
};

exports.showClubCreation = async (req, res) => {
  res.render("createClub", { user: req.user });
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
exports.showCreateClubPage = (req, res) => {
  res.render("createClub");
};

exports.showClubDetails = async (req, res) => {
  try {
    const clubId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return res.status(400).send("Invalid club ID");
    }

    const club = await Club.findOne({
      _id: clubId,
      approved: true
    });

    if (!club) {
      return res.status(404).send("Club not found.");
    }

    const upcoming = [];
    const past = [];
    let joinRequests = [];
    let existingJoinRequest = null;
    let alreadyMember = false;

    if (req.user) {
      alreadyMember = club.members.some(
        memberId => memberId.toString() === req.user._id.toString()
      );

      existingJoinRequest = await JoinRequest.findOne({
        student: req.user._id,
        club: club._id
      }).sort({ createdAt: -1 });

      const isOwner =
        club.createdBy && club.createdBy.toString() === req.user._id.toString();

      const isAdmin =
        club.admins &&
        club.admins.some(adminId => adminId.toString() === req.user._id.toString());

      const isSystemAdmin = req.user.role === "systemAdmin";

      if (isOwner || isAdmin || isSystemAdmin) {
        joinRequests = await JoinRequest.find({
          club: club._id,
          status: "pending"
        }).populate("student");
      }
    }

    res.render("clubDetail", {
      club,
      upcoming,
      past,
      currentPage: "overview",
      joinRequests,
      existingJoinRequest,
      alreadyMember
    });

  } catch (error) {
    console.error("Error loading club details:", error);
    res.status(500).send("Server error");
  }
};

exports.showDashboard = async (req, res) => {
  try {
    if (req.user.role === "systemAdmin") {
      const clubRequests = await ClubCreationRequest.find({status: "pending"})
        .populate("requestedBy")
        .sort({ createdAt: -1 });

      const allUsers = await User.find({ role: { $ne: "systemAdmin" } })
        .sort({ createdAt: -1 });

      return res.render("dashboard", {
        user: req.user,
        isSystemAdminDashboard: true,
        clubRequests,
        allUsers
      });
    }

    const userJoinRequests = await JoinRequest.find({
      student: req.user._id
    }).populate("club");

    const userClubCreationRequests = await ClubCreationRequest.find({
      requestedBy: req.user._id,
      status: { $in: ["pending", "rejected"] }
    }).sort({ createdAt: -1 });

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
      isSystemAdminDashboard: false,
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

exports.showEditProfile = async (req, res) => {
  res.render("editProfile", {user: req.user});
}

exports.submitJoinRequest = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid club ID.");
    }

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
      return res.redirect(`/clubs/${club._id}`);
    }

    const existingRequest = await JoinRequest.findOne({
      student: req.user._id,
      club: club._id,
      status: "pending"
    });

    if (existingRequest) {
      return res.redirect(`/clubs/${club._id}`);
    }

    const joinRequest = new JoinRequest({
      student: req.user._id,
      club: club._id,
      message: "",
      status: "pending"
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
    
    const { proposedName, description, category, contactEmail, website } = req.body;
    if (!proposedName || !description || !category || !contactEmail || !website) {
      return res.status(400).send("All fields are required.");
    }

    const logoPath = req.file
    ? `/images/club-logos/${req.file.filename}`
    : "/images/University_of_Regina_Logo.jpg";

    const request = new ClubCreationRequest({
      requestedBy: req.user._id,
      proposedName: proposedName.trim(),
      description: description.trim(),
      category: category.trim(),
      contactEmail: contactEmail.trim().toLowerCase(),
      website: website.trim(),
      logo: logoPath
    });

    await request.save();

    res.redirect("/dashboard");
  } catch (error) {
    console.error("error submitting club creation request", error);
    res.status(500).send("Error submitting club creation request.");
  }
};

exports.showClubCreationRequests = async (req, res) => {
  return res.redirect("/dashboard");
};

exports.approveClubCreationRequest = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid request ID.");
    }

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
      website: request.website,
      logo: request.logo || "/images/University_of_Regina_Logo.jpg",
      approved: true,
      createdBy: request.requestedBy,
      admins: [request.requestedBy],
      members: [request.requestedBy]
    });

    await newClub.save();

    request.status = "approved";
    await request.save();

    res.redirect("/dashboard");
  } catch (error) {
    console.error("error approving club creation request", error);
    res.status(500).send("Error approving club request.");
  }
};

exports.rejectClubCreationRequest = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid request ID.");
    }

    const request = await ClubCreationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).send("Club creation request not found.");
    }

    if (request.status !== "pending") {
      return res.status(400).send("This request has already been processed.");
    }

    request.status = "rejected";
    await request.save();

    res.redirect("/dashboard");
  } catch (error) {
    console.error("error rejecting club creation request", error);
    res.status(500).send("Error rejecting club request.");
  }
};

exports.showClubJoinRequests = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.clubId)) {
      return res.status(400).send("Invalid club ID.");
    }

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
      club: club._id,
      status: "pending"
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid join request ID.");
    }

    const joinRequest = await JoinRequest.findById(req.params.id).populate("club");

    if (!joinRequest) {
      return res.status(404).send("Join request not found.");
    }

     if (joinRequest.status !== "pending") {
      return res.status(400).send("This join request has already been processed.");
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

    res.redirect(`/clubs/${club._id}`);
  } catch (error) {
    console.error("error approving join request", error);
    res.status(500).send("Error approving join request.");
  }
};

exports.rejectJoinRequest = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid join request ID.");
    }

    const joinRequest = await JoinRequest.findById(req.params.id).populate("club");

    if (!joinRequest) {
      return res.status(404).send("Join request not found.");
    }

    if (joinRequest.status !== "pending") {
      return res.status(400).send("This join request has already been processed.");
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

    res.redirect(`/clubs/${club._id}`);
  } catch (error) {
    console.error("error rejecting join request", error);
    res.status(500).send("Error rejecting join request.");
  }
};

exports.deleteClub = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid club ID.");
    }

    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).send("Club not found.");
    }

    const isCreator =
      club.createdBy && club.createdBy.toString() === req.user._id.toString();

    const isSystemAdmin = req.user.role === "systemAdmin";

    if (!isCreator && !isSystemAdmin) {
      return res.status(403).send("You are not allowed to delete this club.");
    }

    await JoinRequest.deleteMany({ club: club._id });
    await Club.findByIdAndDelete(club._id);

    res.redirect("/dashboard");
  } catch (error) {
    console.error("error deleting club", error);
    res.status(500).send("Error deleting club.");
  }
};