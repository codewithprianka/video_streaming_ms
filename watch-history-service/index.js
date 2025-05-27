const express = require('express');
const app= express();
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const watchHistoryRoute = require('./routes/watchHistoryRoute');
const connectDB = require('./models/connection');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/watch-history', watchHistoryRoute);
connectDB();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Watch History Service is running on port ${PORT}`);
});