const stripe = require('../utils/stripe');
const jwt = require('jsonwebtoken');
const { publishUserSubscription } = require('../utils/rabbitmq');

const createPayment = async (req, res) => {
  const { amount, currency = 'usd' } = req.body;
console.log('Creating payment with amount:', amount,req.user._id);
  const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'Premium Video Access',
            },
            unit_amount: amount * 100, // amount in cents
          },
          quantity: 1,
        },
      ],
      customer_email: req.user.email,
      success_url: `http://localhost:8080/api/payment/success?token=${token}`,
      cancel_url: 'http://localhost:8080/api/payment/cancel',
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error.message);
    res.status(500).json({ message: 'Payment failed' });
  }
};

const successPayment = async (req, res) => {
  const { token } = req.query;

  try {
    res.status(200).json({ message: 'Payment successful' });
    publishUserSubscription(token);
  } catch (error) {
    console.error('Error updating subscription status:', error.message);
    res.status(500).json({ message: 'Failed to update subscription status' });
  }
}

module.exports = {
  createPayment,
  successPayment
};
