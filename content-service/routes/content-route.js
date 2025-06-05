const express = require('express');
const router = express.Router();

const contentController = require('../controllers/contentController');
const contentMiddleware=  require("../middlewares/content-middleware");
const upload = require("../utils/multer");

router.post(
  "/add",
  contentMiddleware,
  (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  },
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "image", maxCount: 1 }
  ]),
  contentController.addContent
);

router.get("/get",contentController.getContent);
router.get("/get/:id",contentController.getContentById);
router.get("/watch/video/:id",contentMiddleware,contentController.watchVideo,contentController.videoStreaming);
router.get("/watch/filter",contentMiddleware,contentController.filterVideoGenre);
router.get("/watch/search",contentMiddleware,contentController.contentSearchByTitle);

module.exports = router;
