const amqplib = require('amqplib');

let channel;

async function connectRabbitMQ() {
  try {
    const connection = await amqplib.connect('amqp://rabbitmq');
    channel = await connection.createChannel();
    await channel.assertQueue('user.subscription');
    console.log('✅ Connected to RabbitMQ and queue asserted');
  } catch (err) {
    console.error('❌ Error connecting to RabbitMQ:', err.message);
    setTimeout(connectRabbitMQ, 5000); // Retry connection after 5 seconds
  }
}

async function publishUserSubscription(token) {
  if (!channel) {
    console.error('❌ Cannot publish: RabbitMQ channel is not ready');
    return;
  }

  const msg = JSON.stringify({ token });
  try {
    channel.sendToQueue('user.subscription', Buffer.from(msg));
    console.log('📤 Published to user.subscription queue:', msg);
  } catch (err) {
    console.error('❌ Failed to publish message:', err.message);
  }
}

module.exports = { connectRabbitMQ, publishUserSubscription };
