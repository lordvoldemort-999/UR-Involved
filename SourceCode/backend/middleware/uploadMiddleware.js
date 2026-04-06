const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../../frontend/public/images/club-logos")

if (!fs.existsSync(uploadDir)) { //this is to ensure the directory exists before multer tries to save files there
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({ //this is where multer will save the uploaded files
  destination: (req, file, cb) => { 
    cb(null, uploadDir); //save to the club-logos directory in the frontend public folder
  },
  filename: (req, file, cb) => { //generate a unique filename using the current timestamp and a random number, and preserve the original file extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, "club-logo-" + uniqueSuffix + extension);
  }
});

const fileFilter = (req, file, cb) => { //this is to ensure only image files are accepted
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extensionOk = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowedTypes.test(file.mimetype);

  if (extensionOk && mimeOk) { //if the file has an allowed extension and MIME type, accept it
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed."));
  }
};

const upload = multer({ //this is the multer instance that will be used in the routes to handle file uploads, with the specified storage, file filter, and size limit
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB
  }
});

module.exports = upload;