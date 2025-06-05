const express=require("express");
const app=express();
const dotenv=require("dotenv");
const cors=require("cors");
const cookieParser=require("cookie-parser");
const contentRoute=require("./routes/content-route");

const ConnetDB=require("./models/connection");

dotenv.config({path:"./config.env"});

app.use(express.json());

app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use(
    cors({
      origin: "http://localhost:5173", // React app URL
      credentials: true, // Allow credentials (cookies, authorization headers, etc.)
      allowedHeaders: "Content-Type",
    })
  );

app.use("/storage/video", express.static("storage/video"));

app.use("/storage/image", express.static("storage/image"));
app.use("/api/content",contentRoute);

ConnetDB();
app.listen(process.env.PORT,()=>{
    console.log(`Content service is running on port ${process.env.PORT}`);
});