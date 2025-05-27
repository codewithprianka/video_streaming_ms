const express = require('express');
const router = express.Router();
const {getWatchHistory,addWatchHistory} = require('../controllers/watchHistoryController');
const authMiddleware = require('../middlewares/authmiddleware');
const contentMiddleware = require('../middlewares/contentMiddleware');

router.post('/add', authMiddleware,contentMiddleware, addWatchHistory);
router.get('/get', authMiddleware, getWatchHistory);

module.exports = router;