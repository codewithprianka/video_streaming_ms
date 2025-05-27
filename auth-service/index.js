const express=require("express");
const app=express();
const dotenv=require("dotenv");
const connectDB=require("./models/connection");
const authRouter=require("./routes/auth_route")
const cors = require("cors");
const startConsumer = require('./utils/rabbitmq');
startConsumer();

dotenv.config({path:"./config.env"});

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({ origin: "http://localhost:8080" }));

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});
app.use("/api/auth",authRouter);


connectDB();
app.listen(process.env.PORT,()=>{
    console.log("listening")
});