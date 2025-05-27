const express=require("express");
const app=express();
const dotenv=require("dotenv");
const contentRoute=require("./routes/content-route");

const ConnetDB=require("./models/connection");

dotenv.config({path:"./config.env"});

app.use(express.json());

app.use(express.urlencoded({extended:true}));

app.use("/storage/videos", express.static("storage/videos"));
app.use("/api/content",contentRoute);

ConnetDB();
app.listen(process.env.PORT,()=>{
    console.log(`Content service is running on port ${process.env.PORT}`);
});