const express=require("express");
const app=express();
const dotenv=require("dotenv");
const rateLimit=require('express-rate-limit');
const connectDB=require("./models/connection");
const authRouter=require("./routes/auth_route")
const cors = require("cors");
const startConsumer = require('./utils/rabbitmq');
startConsumer();

dotenv.config({path:"./config.env"});

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(
  cors({
    origin: "http://localhost:5173", // React app URL
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    allowedHeaders: "Content-Type",
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

app.use(limiter);

app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});
app.use("/api/auth",authRouter);


connectDB();

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1); // mandatory restart
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(reason);
  server.close(() => {
    process.exit(1); // close server gracefully
  });
});

app.listen(process.env.PORT,()=>{
    console.log("listening")
});