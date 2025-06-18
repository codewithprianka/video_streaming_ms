const User=require("../models/user_model");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const validator = require('validator');


// Register a new user

const registerUser = async (req, res) => {
  let { name, email, password, cpassword } = req.body;

  // Sanitize input
  name = name?.trim();
  email = email?.trim().toLowerCase();
  password = password?.trim();
  cpassword = cpassword?.trim();

  // Basic checks
  if (!name || !email || !password || !cpassword) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password !== cpassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      cpassword
    });

    // Create JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: parseInt(process.env.JWT_EXPIRY) }
    );

    res.status(201).json({ message: "User registered successfully", token });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
const loginUser=async(req,res,next)=>{
    let {email,password}=req.body;
    email=email?.trim().toLowerCase();
    password=password?.trim();

    if(!email || !password){
        return res.status(400).json({message:"Please fill all fields"});
    }
    if(!validator.isEmail(email)){
        return res.status(400).json({message:"Invalid email format"});
    }
    try {
        // Check if user exists
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid credentials"});
        }
        // Check password
        const isMatch=await user.comparePassword(password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid credentials"});

        }
        const token=jwt.sign({id:user._id,role:user.role,email:user.email},process.env.JWT_SECRET,{expiresIn:parseInt(process.env.JWT_EXPIRY)});
        
        
    // Store token in HTTP-only cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // secure only in prod
        sameSite: 'Strict',
        maxAge: parseInt(process.env.JWT_EXPIRY) * 1000 // convert seconds to ms
      });
        res.status(200).json({message:"User logged in successfully",token});
    } catch (error) {
      next(error);    
    }
}

// Get user profile
const getUserProfile=async(req,res)=>{
    try {
        const user=await User.findById(req.user.id);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json({user});
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}
const validateUser=async(req,res)=>{
    try{
        const user=await User.findById(req.query.did);
       
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json({user});
    }catch (error) {
        res.status(500).json({message:error.message});
    }
}

const forgetPasswordToken=async (req, res) => {
    // This function is not implemented in the original code
    let {email}=req.body;
    email=email?.trim().toLowerCase();
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    if (!validator.isEmail(email)) {  
        return res.status(400).json({ message: "Invalid email format" });
    }
    
    const response=await User.findOne({email});
    console.log(response,"user");
    if(!response){
        return res.status(404).json({ message: "User not found" });
    }
    // Logic to send reset password email goes here
    const resetToken = jwt.sign({ id: email }, process.env.JWT_RESET_SECRET, { expiresIn: '1h' });
 if(!resetToken) {
        return res.status(500).json({ message: "Error generating reset token" });
    }
    res.status(200).json({token:resetToken, message: "Redirect to token page." });
}
const forgetPasswordTokenverify = (req, res) => {
    // This function is not implemented in the original code
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }
    jwt.verify(token, process.env.JWT_RESET_SECRET, (err, decoded) => {
        if (err) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        // Logic to reset password goes here
        res.status(200).json({ token:token, message: "Token is valid. Proceed to reset password." });
    });
  }
const forgetPasswordUpadate = async (req, res) => {
    try {
        const {  newPassword, confirmPassword } = req.body;
        const decoded = jwt.verify(req.query.resetToken, process.env.JWT_RESET_SECRET); // or use req.user if using auth middleware

        const user = await User.findOne({ email: decoded.id });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
      
        user.password = newPassword;
        user.cpassword = confirmPassword; // only if you're storing confirmPassword
        await user.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


const updatePassword = async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
  
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }
  
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }
      user.password = newPassword;
      user.cpassword = confirmPassword;
      await user.save();
      res.status(200).json({ message: "Password updated successfully" });
    }
    catch (error) {
      res.status(500).json({ message: error.message });
    }
}

module.exports={
    registerUser,
    loginUser,
    getUserProfile,
    validateUser,
    forgetPasswordToken,
    forgetPasswordTokenverify,
    forgetPasswordUpadate,
    updatePassword
}
