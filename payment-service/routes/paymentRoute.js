const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const paymentMiddleware = require('../middlewares/paymentMiddleware');

// Route to create a payment
router.post('/create', paymentMiddleware, paymentController.createPayment);
router.get('/success', paymentController.successPayment);
module.exports = router;