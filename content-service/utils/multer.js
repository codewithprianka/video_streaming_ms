// Set storage engine
const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "video") {
      cb(null, "storage/video");
    } else if (file.fieldname === "image") {
      cb(null, "storage/image");
    } else {
      cb(new Error("Unknown file field"));
    }
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const videoTypes = /mp4|mkv|mov|avi/;
  const imageTypes = /jpg|jpeg|png|webp/;

  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === "video" && videoTypes.test(ext)) {
    cb(null, true);
  } else if (file.fieldname === "image" && imageTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type for " + file.fieldname));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
});

module.exports = upload;



