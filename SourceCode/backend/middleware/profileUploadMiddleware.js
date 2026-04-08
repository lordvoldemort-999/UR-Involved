const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../../frontend/public/images/profile-pictures");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, "profile-" + uniqueSuffix + extension);
  }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extensionOk = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowedTypes.test(file.mimetype);

    if (extensionOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024
  }
});

module.exports = upload;