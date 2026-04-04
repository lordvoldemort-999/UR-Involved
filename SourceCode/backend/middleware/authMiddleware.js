exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/login");
};

exports.ensureStudent = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "student") {
    return next();
  }
  return res.status(403).send("Only students can do this.");
};

exports.ensureSystemAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "systemAdmin") {
    return next();
  }
  return res.status(403).send("Only system admins can do this.");
};

exports.ensureClubAdminOrSystemAdmin = (req, res, next) => {
  if (
    req.isAuthenticated() &&
    (req.user.role === "clubAdmin" || req.user.role === "systemAdmin")
  ) {
    return next();
  }
  return res.status(403).send("You do not have permission to do this.");
};