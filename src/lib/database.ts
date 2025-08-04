import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Initialize database schema
export async function initializeDatabase(): Promise<boolean> {
  console.log('🗄️  Initializing database schema...');
  
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Business profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS business_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        offer TEXT NOT NULL,
        avatar TEXT NOT NULL,
        problems TEXT NOT NULL,
        desires TEXT NOT NULL,
        tone VARCHAR(50) NOT NULL,
        language VARCHAR(10) DEFAULT 'pl',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Campaigns table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        business_profile_id INTEGER REFERENCES business_profiles(id) ON DELETE CASCADE,
        vsl_title VARCHAR(255) NOT NULL,
        vsl_script_a TEXT,
        vsl_script_b TEXT,
        video_scripts JSONB,
        ad_copy_a TEXT,
        ad_copy_b TEXT,
        headline_a VARCHAR(255),
        headline_b VARCHAR(255),
        language VARCHAR(10) DEFAULT 'pl',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
          // Add missing columns to existing tables (migration)
      try {
        await pool.query('ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT \'pl\'');
        await pool.query('ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        await pool.query('ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT \'pl\'');
        await pool.query('ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        console.log('✅ Database migration completed');
      } catch (error) {
        console.log('ℹ️  Migration step completed (columns may already exist)');
      }
      
      // Update existing profiles and campaigns to Polish
      try {
        console.log('🔄 Updating existing data to Polish...');
        
        // Update business profiles
        const profileUpdateResult = await pool.query(`
          UPDATE business_profiles 
          SET language = 'pl', updated_at = CURRENT_TIMESTAMP 
          WHERE language IS NULL OR language != 'pl'
        `);
        console.log(`✅ Updated ${profileUpdateResult.rowCount} business profiles to Polish`);
        
        // Update campaigns
        const campaignUpdateResult = await pool.query(`
          UPDATE campaigns 
          SET language = 'pl', updated_at = CURRENT_TIMESTAMP 
          WHERE language IS NULL OR language != 'pl'
        `);
        console.log(`✅ Updated ${campaignUpdateResult.rowCount} campaigns to Polish`);
        
        console.log('🎉 All existing data updated to Polish!');
      } catch (error) {
        console.log('ℹ️  Data update step completed (may already be up to date)');
      }
    
    // Create indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_campaigns_business_profile_id ON campaigns(business_profile_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_campaigns_language ON campaigns(language)');
    
    // Create updated_at trigger function
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);
    
    // Create triggers for updated_at columns
    await pool.query(`
      DROP TRIGGER IF EXISTS update_business_profiles_updated_at ON business_profiles;
      CREATE TRIGGER update_business_profiles_updated_at 
          BEFORE UPDATE ON business_profiles 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column()
    `);
    
    await pool.query(`
      DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
      CREATE TRIGGER update_campaigns_updated_at 
          BEFORE UPDATE ON campaigns 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column()
    `);
    
    console.log('✅ Database schema initialized successfully');
    console.log('📋 Tables created: users, business_profiles, campaigns');
    console.log('📊 Indexes created: email, user_id, business_profile_id, language');
    console.log('🔧 Triggers created: updated_at for business_profiles and campaigns');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.error('🔍 Error details:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});