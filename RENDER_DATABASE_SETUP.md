# Setting Up Database on Render

This guide will help you set up a PostgreSQL database on Render for your VSL-Alchemist application.

## 🚀 Quick Setup (Recommended)

### Option 1: Using Render Blueprint (Easiest)

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign in to your account

2. **Create Blueprint**
   - Click "New +" → "Blueprint"
   - Connect your Git repository
   - Render will automatically detect `render.yaml`

3. **Set Environment Variables**
   - In your service settings, go to "Environment" tab
   - Add these variables:
   ```bash
   DATABASE_URL=postgresql://username:password@host:port/database
   JWT_SECRET=your_jwt_secret_here
   GOOGLE_API_KEY=your_google_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Deploy**
   - Render will automatically create the database and deploy your app

### Option 2: Manual Database Setup

#### Step 1: Create PostgreSQL Database

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Click "New +" → "PostgreSQL"

2. **Configure Database**
   ```
   Name: vsl-alchemist-db
   Database: vsl_alchemist
   User: vsl_user
   Plan: Starter (or higher for production)
   ```

3. **Get Connection String**
   - Copy the "Internal Database URL"
   - It looks like: `postgresql://vsl_user:password@host:5432/vsl_alchemist`

#### Step 2: Create Web Service

1. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your Git repository

2. **Configure Service**
   ```
   Name: vsl-alchemist
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Set Environment Variables**
   - Go to "Environment" tab
   - Add these variables:
   ```bash
   DATABASE_URL=postgresql://vsl_user:password@host:5432/vsl_alchemist
   JWT_SECRET=your_very_secure_jwt_secret_here
   GOOGLE_API_KEY=your_google_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   NODE_ENV=production
   PORT=10000
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Monitor the deployment

## 🔧 Database Schema

The application will automatically create the required tables when it first connects to the database. Here's what gets created:

### Tables

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business profiles table
CREATE TABLE business_profiles (
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

-- Campaigns table
CREATE TABLE campaigns (
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
```

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_business_profile_id ON campaigns(business_profile_id);
```

## 🧪 Testing Your Setup

### 1. Health Check
```bash
curl https://your-app-name.onrender.com/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. API Info
```bash
curl https://your-app-name.onrender.com/
```

Expected response:
```json
{
  "name": "VSL-Alchemist API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "/health",
    "auth": "/api/auth",
    "profiles": "/api/profiles",
    "campaigns": "/api/campaigns"
  }
}
```

### 3. Test Database Connection
```bash
# Test user registration
curl -X POST https://your-app-name.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🔍 Troubleshooting

### Database Connection Issues

1. **Check DATABASE_URL**
   ```bash
   # Verify the connection string format
   postgresql://username:password@host:port/database
   ```

2. **Test Database Connection**
   ```bash
   # Use psql to test connection
   psql "postgresql://username:password@host:port/database"
   ```

3. **Check Render Logs**
   - Go to your service in Render dashboard
   - Click "Logs" tab
   - Look for database connection errors

### Common Issues

1. **"Database connection failed"**
   - ✅ Check DATABASE_URL environment variable
   - ✅ Verify database is running on Render
   - ✅ Check if database credentials are correct

2. **"Permission denied"**
   - ✅ Ensure database user has proper permissions
   - ✅ Check if database exists

3. **"Connection timeout"**
   - ✅ Verify database is in the same region as your app
   - ✅ Check if database is accessible

## 🔒 Security Best Practices

### Environment Variables
- ✅ Never commit API keys to Git
- ✅ Use Render's environment variable system
- ✅ Rotate secrets regularly

### Database Security
- ✅ Use strong passwords
- ✅ Enable SSL connections
- ✅ Regular backups

## 📊 Monitoring

### Database Metrics
- Monitor database connections
- Check query performance
- Set up alerts for high usage

### Application Metrics
- Monitor API response times
- Check error rates
- Set up uptime monitoring

## 🔄 Backup and Recovery

### Automatic Backups
Render provides automatic backups for PostgreSQL databases:
- Daily backups
- 7-day retention (Starter plan)
- 30-day retention (Standard plan)

### Manual Backups
```bash
# Export database
pg_dump "postgresql://username:password@host:port/database" > backup.sql

# Import database
psql "postgresql://username:password@host:port/database" < backup.sql
```

## 💰 Cost Optimization

### Render Database Plans
- **Starter**: $7/month, 1GB storage
- **Standard**: $25/month, 10GB storage
- **Pro**: $50/month, 50GB storage

### Tips
- Start with Starter plan for development
- Monitor usage and upgrade as needed
- Use appropriate plan sizes

## 🆘 Support

If you encounter issues:

1. **Check Render Documentation**: [docs.render.com](https://docs.render.com)
2. **View Application Logs**: In Render dashboard
3. **Test Locally**: Use Docker setup first
4. **Contact Support**: Through Render dashboard

## 🚀 Next Steps

After successful database setup:

1. **Test all API endpoints**
2. **Set up monitoring and alerting**
3. **Configure custom domain**
4. **Set up CI/CD pipeline**
5. **Implement logging and error tracking** 