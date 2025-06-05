const WatchHistory = require('../models/watchHistoryModel');
const getWatchHistory = async (req, res) => {
    try {
        // Logic to retrieve watch history
        const userId = req.user._id; // Assuming user ID is stored in req.user
        const history = await WatchHistory.find({ userId:userId }).sort({ watchedAt: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve watch history' });
    }
}


const addWatchHistory = async (req, res) => {
    try {
        // Logic to add watch history
        const userId = req.user._id; // Assuming user ID is stored in req.user
        const {videoId,progress } = req.body;
        if (!userId || !videoId ) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        try {
            const history = await WatchHistory.findOneAndUpdate(
                { userId, videoId ,progress},
                { $set: { watchedAt: new Date() } },
                { upsert: true, new: true }
              );
          console.log("Watch history updated:", history);
              res.status(200).json({ message: "History updated", history });
        } catch (validationError) {
            return res.status(400).json({ error: 'Invalid userId or videoId' });
        }        
        res.status(201).json({ message: 'Watch history added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add watch history' });
    }
}

const test=()=>{
    console.log("test");
}

module.exports = {
    getWatchHistory,
    addWatchHistory,
    test
};