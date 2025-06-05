const express = require('express');
const app= express();
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const cors = require('cors');
const watchHistoryRoute = require('./routes/watchHistoryRoute');
const connectDB = require('./models/connection');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173", // React app URL
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    allowedHeaders: "Content-Type",
  })
);


app.use('/api/watch-history', watchHistoryRoute);
connectDB();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Watch History Service is running on port ${PORT}`);
});