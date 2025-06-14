const Stripe = require('stripe');
const dotenv = require('dotenv');
dotenv.config({path:"./config.env"});

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
module.exports = stripe;
