const mongoose = require('mongoose');
const watchHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },   // Store as plain string
  videoId: { type: String, required: true },  // Store as plain string
  watchedAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 0 }      // in seconds or percent
}, { timestamps: true });

// Optional: to ensure one entry per user/video
watchHistorySchema.index({ userId: 1, videoId: 1 }, { unique: true });

const WatchHistory = mongoose.model('WatchHistory', watchHistorySchema);
module.exports = WatchHistory;