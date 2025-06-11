const express = require('express');
const Route = express.Router();
const authController = require('../controllers/auth-controller');
const authMiddleware = require('../middleware/auth-middleware');
const { registerUser, loginUser, getUserProfile,validateUser } = authController;

Route.post("/validateUser", validateUser);
// Register route
Route.route('/register').post( registerUser);
// Login route
Route.route('/login').post(loginUser);

// Get user profile route
Route.route('/profile').get(authMiddleware, getUserProfile);
Route.post('/forgetPasswordToken', authController.forgetPasswordToken);
Route.post('/forgetPasswordTokenverify', authController.forgetPasswordTokenverify);
Route.post('/forgetPasswordUpadate', authController.forgetPasswordUpadate);
Route.post('/updatePassword', authMiddleware, authController.updatePassword);
// Middleware to protect routes

// Export the router
module.exports = Route;