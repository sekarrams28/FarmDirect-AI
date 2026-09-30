const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (uri) {
    try {
      console.log('Attempting to connect to MongoDB Atlas...');
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      return;
    } catch (err) {
      console.error('MongoDB Atlas connection failed:', err.message);
      console.log('Falling back to In-Memory MongoDB for temporary testing...');
    }
  } else {
    console.log('No MONGO_URI provided. Using In-Memory MongoDB for temporary testing...');
  }

  try {
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.warn(`\n⚠️  WARNING: Connected to IN-MEMORY MongoDB at ${mongoUri}`);
    console.warn(`⚠️  ALL DATA WILL BE LOST when the server restarts!\n`);
  } catch (err) {
    console.error('Failed to start In-Memory MongoDB:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
