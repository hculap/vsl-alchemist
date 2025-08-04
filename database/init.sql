-- VSL-Alchemist Database Initialization Script
-- This script runs when the PostgreSQL container starts

-- Create user if it doesn't exist
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'vsl_user') THEN
      CREATE USER vsl_user WITH PASSWORD 'vsl_password';
   END IF;
END
$do$;

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE vsl_alchemist'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'vsl_alchemist')\gexec

-- Grant privileges to user
GRANT ALL PRIVILEGES ON DATABASE vsl_alchemist TO vsl_user;

-- Connect to the database
\c vsl_alchemist;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO vsl_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vsl_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vsl_user;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create business_profiles table
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
);

-- Create campaigns table
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
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_business_profile_id ON campaigns(business_profile_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for business_profiles
CREATE TRIGGER update_business_profiles_updated_at 
    BEFORE UPDATE ON business_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vsl_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vsl_user;

-- Insert sample data (optional - for development)
-- INSERT INTO users (email, password_hash) VALUES 
--   ('admin@example.com', '$2b$10$example.hash.here');

-- Print success message
DO $$
BEGIN
    RAISE NOTICE 'VSL-Alchemist database initialized successfully!';
END $$;