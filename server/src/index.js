import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the server folder and parent directories
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';
import { initializeSocket } from './socket/index.js';
import { seedDemoUsers } from './utils/seed.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB (Primary 100% Free Database)
    await connectDB();

    // Seed demo accounts (Alice & Bob) if they do not exist
    await seedDemoUsers();

    // Create HTTP server and attach Socket.IO
    const httpServer = createServer(app);
    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`\n🔐 CipherChat Server — 100% Free Zero-Cost Stack`);
      console.log(`───────────────────────────────────────────────`);
      console.log(`🚀 Server:  http://localhost:${PORT}`);
      console.log(`📡 API:     http://localhost:${PORT}/api`);
      console.log(`🏥 Health:  http://localhost:${PORT}/api/health`);
      console.log(`🌍 Env:     ${process.env.NODE_ENV || 'development'}`);
      console.log(`───────────────────────────────────────────────\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
