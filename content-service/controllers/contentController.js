const Content=require("../models/content_model");
const path = require('path');
const fs = require('fs');

const addContent = async (req, res) => {
    console.log("Adding content with title:", req.body);
    try{
        const isAdmin=req.user.role==="admin";
        if(!isAdmin){
            return res.status(403).json({message:"Access denied"});
        }
        const { title, description, genre, isPremium } = req.body;
      
   const videoFile = req.files?.video?.[0];
    const imageFile = req.files?.image?.[0];

    if (!videoFile || !imageFile) {
      return res.status(400).json({ message: "Both video and image are required" });
    }

    const videoUrl = `/storage/video/${videoFile.filename}`;
    const imageUrl = `/storage/image/${imageFile.filename}`;

    if(!videoUrl){
        return res.status(400).json({message:"Video is required"});
    }
     if(!imageUrl){
        return res.status(400).json({message:"Image is required"});
    }
        const content = new Content({
            title,
            description,
            imageUrl,
            videoUrl,
            genre: genre.split(","),
            isPremium
        });
        await content.save();
        return res.status(201).json({message:"Content added successfully",content});
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
    }
}

const getContent=async(req,res)=>{
    const response=await Content.find();
    if(!response){
        return res.status(404).json({message:"Content not found"});
    }
    return res.status(200).json({message:"Content found",response});
}

const getContentById=async(req,res)=>{
    const {id}=req.params;
    const response=await Content.findById(id);
    if(!response){
        return res.status(404).json({message:"Content not found"});
    }
    return res.status(200).json({message:"Content found",response});
}

const watchVideo=async(req,res,next)=>{
    const {subscription}=req.user;
    try{
        if(!subscription){
            res.setHeader('Content-Type', 'application/json');
            return res.status(403).json({message:"You need to subscribe to watch this video"});
        }
        const {id}=req.params;
        const content=await Content.findById(id);
        if(!content){
            return res.status(404).json({message:"Content not found"});
        }
        req.content = content;
        next();
    }catch(error){
        return res.status(500).json({message:"Internal server error"});
    }

}

const filterVideoGenre = async (req, res) => {
    const { genre } = req.query;
    if (!genre) {
        return res.status(400).json({ message: "Genre is required" });
    }
    try {
        const genres = genre.split(",").map(g => new RegExp(`^${g}$`, 'i'));
        const content = await Content.find({ genre: { $in: genres } });
        if (content.length === 0) {
            return res.status(404).json({ message: "No content found for the specified genre" });
        }
        return res.status(200).json({ message: "Content found", content });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const contentSearchByTitle = async (req, res) => {
    const { title } = req.query;
    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }
    try {
        const content = await Content.find({ title: new RegExp(title, 'i') });

        if (content.length === 0) {
            return res.status(404).json({ message: "No content found with the specified title" });
        }
        return res.status(200).json({ message: "Content found", content });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
const videoStreaming= (req, res) => {
    console.log("Streaming video for content ID:");
    const videoPath = path.join(__dirname,"../",req.content.videoUrl);
    if (!fs.existsSync(videoPath)) {
      return res.status(404).send('Video not found');
    }
  
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
  
    if (!range) {
      return res.status(416).send('Range header required');
    }
  
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  
    const chunkSize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const contentType = 'video/mp4'; // or infer from extension
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
    };
    res.writeHead(206, headers);
    file.pipe(res);
}

module.exports = {
    addContent,
    getContent,
    getContentById,
    watchVideo,
    filterVideoGenre,
    contentSearchByTitle,
    videoStreaming
}
