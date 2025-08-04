import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './lib/database';
import { authRoutes } from './routes/auth';
import { profileRoutes } from './routes/profiles';
import campaignRoutes from './routes/campaigns';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files if they exist
const publicPath = path.join(__dirname, '../public');
try {
  require('fs').accessSync(publicPath);
  app.use(express.static(publicPath));
} catch (error) {
  console.log('📁 Public directory not found, skipping static file serving');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/campaigns', campaignRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'VSL-Alchemist API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      profiles: '/api/profiles',
      campaigns: '/api/campaigns'
    },
    documentation: 'See README.md for API documentation'
  });
});

// Start server
app.listen(PORT, async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('💡 To set up database:');
    console.log('   1. Create a PostgreSQL database on Render');
    console.log('   2. Set DATABASE_URL environment variable');
    console.log('   3. Or use Docker: ./scripts/docker-deploy.sh');
  }
  
  console.log(`🚀 VSL-Alchemist server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nClosing database pool...');
  await pool.end();
  console.log('Shutting down all Genkit servers...');
  process.exit(0);
});