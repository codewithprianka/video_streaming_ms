const axios=require("axios");

const contentMiddleware=async(req,res,next)=>{
 const {videoId}=req.body;
   if(!videoId)
    {
     return res.status(400).json({message:"Video ID is required"});
    }
     try{
     
      const response=await axios.get(`${process.env.CONTENT_SERVICE_URL}/api/content/get/${videoId}`);
      console.log("Response from content service:", response.data);
      if(response.status!==200){
      return res.status(404).json({message:"Content not found"});
     }
     next();
} catch(error){
    return res.status(500).json({message:"Internal Server Error"});
}
}

module.exports= contentMiddleware;
