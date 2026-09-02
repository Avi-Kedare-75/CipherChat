import 'dotenv/config';
import { createServer } from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import connectRedis from './config/redis.js';
import { initializeSocket } from './socket/index.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis (optional — app works without it)
    connectRedis();

    // Create HTTP server and attach Socket.IO
    const httpServer = createServer(app);
    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`\n🔐 CipherChat Server`);
      console.log(`───────────────────────────────`);
      console.log(`🚀 Server:  http://localhost:${PORT}`);
      console.log(`📡 API:     http://localhost:${PORT}/api`);
      console.log(`🏥 Health:  http://localhost:${PORT}/api/health`);
      console.log(`🌍 Env:     ${process.env.NODE_ENV}`);
      console.log(`───────────────────────────────\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
