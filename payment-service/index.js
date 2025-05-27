const express= require('express');
const app= express();
const dotenv=require('dotenv');
const paymentRoutes=require('./routes/paymentRoute');
const { connectRabbitMQ }=require('./utils/rabbitmq');
const webhookRoute = require('./routes/stripeWebhook');


dotenv.config({path:'./config.env'});


app.use('/webhook', webhookRoute);
app.use(express.json());
app.use(express.urlencoded({extended:true}));

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