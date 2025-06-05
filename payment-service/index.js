const express= require('express');
const app= express();
const cors = require('cors');
const dotenv=require('dotenv');
const cookieParser=require("cookie-parser");
const paymentRoutes=require('./routes/paymentRoute');
const { connectRabbitMQ }=require('./utils/rabbitmq');

dotenv.config({path:'./config.env'});

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

app.use('/api/payment', paymentRoutes);


try{
connectRabbitMQ();
console.log("Connected to RabbitMQ");
}catch(error){
    console.error("Error connecting to RabbitMQ",error);
}

app.listen(process.env.PORT, () => {
    console.log(`Payment service running on port ${process.env.PORT}`);
});