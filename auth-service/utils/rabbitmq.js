const amqp = require('amqplib');
const User = require('../models/user_model'); // adjust path if needed
const jwt = require('jsonwebtoken');
async function startConsumer() {
  let connection;

  async function connectRabbitMQ() {
    try {
      connection = await amqp.connect('amqp://rabbitmq:5672');
      console.log('✅ Connected to RabbitMQ');
      const channel = await connection.createChannel();
      await channel.assertQueue('user.subscription');

      channel.consume('user.subscription', async (msg) => {
        console.log('📩 Received message:', msg.content.toString());
        const { token } = JSON.parse(msg.content.toString());
        console.log('📩 Received subscription update for:', token);

        try {
          const payload  = jwt.verify(token, process.env.JWT_SECRET);
          console.log('📩 Decoded payload:', payload.userId);
          await User.findByIdAndUpdate(payload.userId, { subscription: true });
          console.log('✅ User subscription updated');
        } catch (err) {
          console.error('❌ Failed to update user:', err.message);
        }

        channel.ack(msg);
      });
    } catch (err) {
      console.error('❌ Failed to connect to RabbitMQ:', err.message);
      setTimeout(connectRabbitMQ, 5000); // retry in 3 seconds
    }
  }

  await connectRabbitMQ();
}

module.exports = startConsumer;
