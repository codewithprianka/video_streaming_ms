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
const loginUser=async(req,res)=>{
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
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:parseInt(process.env.JWT_EXPIRY)});
        
        
    // Store token in HTTP-only cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // secure only in prod
        sameSite: 'Strict',
        maxAge: parseInt(process.env.JWT_EXPIRY) * 1000 // convert seconds to ms
      });
        res.status(200).json({message:"User logged in successfully",token});
    } catch (error) {
        res.status(500).json({message:error.message});
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

module.exports={
    registerUser,
    loginUser,
    getUserProfile,
    validateUser
}
