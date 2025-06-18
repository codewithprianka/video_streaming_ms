const jwt=require("jsonwebtoken");
const User=require("../models/user_model");
const dotenv=require("dotenv");
dotenv.config({path:"../config.env"});


const authMiddleware=async(req,res,next)=>{
    let token=req.headers["authorization"];
    if(token && token.startsWith("Bearer")){
        token=token.split(" ")[1];
    }
  
    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }
    try {
        const decoded=await jwt.verify(token,process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);
        req.user=await User.findById(decoded.id);
           console.log("Decoded Token:", decoded);
        next();
    } catch (error) {
        return res.status(401).json({message:"Unauthorized",error:error.message});
    }
}


module.exports=authMiddleware;
