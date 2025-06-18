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
       const payload  = jwt.verify(token, process.env.JWT_SECRET);
   
    if(!payload || !payload.userId) {
      return res.redirect('http://localhost:5173/subscription-error'); 
    }
      await publishUserSubscription(token);
      res.redirect('http://localhost:5173'); // Redirect to success page
    
  } catch (error) {
    console.error('Error updating subscription status:', error.message);
    return res.redirect('http://localhost:5173/subscription-error');  }
}

const paymentDetailsByEmail = async (req, res) => {
  try {
    console.log("Fetching payment details for email:", req.user.email);
    const email = req.user.email;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const customers = await stripe.customers.search({
      query: `email:'${email}'`
    });

    if (!customers.data.length) {
      throw new Error('No customer found with this email');
    }

    const customer = customers.data[0];

    const payments = await stripe.paymentIntents.list({
      customer: customer.id,
      limit: 10
    });

    res.status(200).json(payments.data) ;
  } catch (err) {
    console.error('Error fetching payment history:', err.message);
    res.status(500).json({ message: 'Failed to fetch payment history' });
  }
};

module.exports = {
  createPayment,
  successPayment,
  paymentDetailsByEmail
};
