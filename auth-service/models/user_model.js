const mongoose=require("mongoose");
const bcrypt=require("bcrypt");

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String,
        required:true
    },
    subscription:{
        type:Boolean,
        default:false
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
},  
{timestamps:true}
);
// Hash password before saving to DB
userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        if(this.password!==this.cpassword){
            throw new Error("Passwords do not match");
        }
        this.password=await bcrypt.hash(this.password,10); //10 refers to how many times bcrypt will process the data — it’s 2¹⁰ = 1024 rounds of hashing internally.
        this.cpassword=undefined;
    }
    next();
});
// Compare password method
userSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password);
}
// Create User model
const User=mongoose.model("User",userSchema);
// Export User model
module.exports=User;