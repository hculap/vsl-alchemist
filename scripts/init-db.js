#!/usr/bin/env node

/**
 * Database Initialization Script
 * Run this script to set up the database schema for VSL-Alchemist
 */

import { pool } from '../src/lib/database.js';
import dotenv from 'dotenv';

dotenv.config();

const initDatabase = async () => {
  console.log('🗄️  Initializing VSL-Alchemist database...');
  
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // Create tables
    console.log('📋 Creating tables...');
    
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');
    
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
        language VARCHAR(10) DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Business profiles table created');
    
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Campaigns table created');
    
    // Create indexes
    console.log('📊 Creating indexes...');
    
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_campaigns_business_profile_id ON campaigns(business_profile_id)');
    console.log('✅ Indexes created');
    
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
    
    // Create trigger for business_profiles
    await pool.query(`
      DROP TRIGGER IF EXISTS update_business_profiles_updated_at ON business_profiles;
      CREATE TRIGGER update_business_profiles_updated_at 
          BEFORE UPDATE ON business_profiles 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('✅ Triggers created');
    
    // Grant permissions (if needed)
    try {
      await pool.query('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vsl_user');
      await pool.query('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vsl_user');
      console.log('✅ Permissions granted');
    } catch (error) {
      console.log('⚠️  Could not grant permissions (user might not exist)');
    }
    
    console.log('🎉 Database initialization completed successfully!');
    console.log('');
    console.log('📋 Database Summary:');
    console.log('  - Users table: ✅');
    console.log('  - Business profiles table: ✅');
    console.log('  - Campaigns table: ✅');
    console.log('  - Indexes: ✅');
    console.log('  - Triggers: ✅');
    console.log('');
    console.log('🚀 Your VSL-Alchemist database is ready!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run the initialization
initDatabase(); 