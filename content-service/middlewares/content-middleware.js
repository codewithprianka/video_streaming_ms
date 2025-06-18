const jwt=require("jsonwebtoken");
const axios=require("axios");

const contentMiddleware=async(req,res,next)=>{
    if (!req.headers['authorization'] && req.cookies.token) {
        req.headers['authorization'] = `Bearer ${req.cookies.token}`;
      }
    let token=req.headers["authorization"];
    console.log("Token received:", token);
    if(token && token.startsWith("Bearer")){
        token=token.split(" ")[1];
    }

    if(!token){
        return res.status(401).json({message:"Unauthorized "});
    }
    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);
        const response=await axios.post(`${process.env.AUTH_SERVICE_URL}/api/auth/validateUser?did=${decoded.id}`);
      
        if(response.status!==200){
            return res.status(401).json({message:"Unauthorized attempt"});
        }
        console.log("User validated:",response, response.data.user);
        // Attach user information to the request object
        req.user=response.data.user;
           console.log("Decoded Token:", decoded);
        next();
    } catch (error) {
        return res.status(401).json({message:"Unable to authenticate user",error:error.message});
    }
}


module.exports=contentMiddleware;
