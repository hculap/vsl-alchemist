import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './lib/database';
import { authRoutes } from './routes/auth';
import { profileRoutes } from './routes/profiles';
import campaignRoutes from './routes/campaigns';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/campaigns', campaignRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve the main app
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Start server
app.listen(PORT, async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
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