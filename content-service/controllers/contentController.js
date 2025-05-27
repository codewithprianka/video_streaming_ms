const Content=require("../models/content_model");

const addContent = async (req, res) => {
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

    const videoUrl = `/storage/videos/${videoFile.filename}`;
    const imageUrl = `/storage/images/${imageFile.filename}`;

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

const watchVideo=async(req,res)=>{
    const {subscription}=req.user;
    try{
        if(!subscription){
            return res.status(403).json({message:"You need to subscribe to watch this video"});
        }
        const {id}=req.params;
        const content=await Content.findById(id);
        res.status(200).json({message:"Video found",content});
        if(!content){
            return res.status(404).json({message:"Content not found"});
        }
        return res.status(200).json({message:"Content found",content});
    }catch(error){
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
    }}

module.exports = {
    addContent,
    getContent,
    getContentById,
    watchVideo
}
