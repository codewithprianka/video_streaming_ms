const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    genre: {
        type: [String],
        required: true
    },
    isPremium: {
        type: Boolean,
        default: false
    }
},{timestamps:true});
const Content = mongoose.model('Content', contentSchema);
module.exports = Content;