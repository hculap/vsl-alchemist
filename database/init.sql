-- Initialize VSL-Alchemist Database
-- Run this file to set up the database structure

-- Create database (run as postgres superuser)
-- CREATE DATABASE vsl_alchemist;

-- Connect to the database and run the schema
\c vsl_alchemist;
\i schema.sql;

-- Insert sample data for development (optional)
INSERT INTO users (email, password_hash) VALUES 
  ('demo@example.com', '$2b$10$example.hash.for.development.only');

INSERT INTO business_profiles (user_id, offer, avatar, problems, desires, tone) VALUES 
  (1, 'High-ticket coaching program', 'Business owners struggling with scaling', 'Limited time and overwhelmed with tasks', 'Freedom and automated systems', 'Professional');

-- Create application user (adjust credentials as needed)
-- CREATE USER vsl_app WITH PASSWORD 'your_secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO vsl_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO vsl_app;