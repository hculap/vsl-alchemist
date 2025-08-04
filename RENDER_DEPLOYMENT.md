# Deploying VSL-Alchemist to Render

This guide will walk you through deploying the VSL-Alchemist application to Render, a cloud platform that makes it easy to deploy web services and databases.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)
3. **API Keys**: You'll need your Google AI and/or OpenAI API keys

## Step 1: Prepare Your Repository

### 1.1 Ensure Required Files Are Present

Your repository should include:
- ✅ `package.json` - Node.js dependencies and scripts
- ✅ `render.yaml` - Render configuration
- ✅ `Dockerfile` - Container configuration
- ✅ `.dockerignore` - Files to exclude from Docker build
- ✅ `src/server.ts` - Main application entry point
- ✅ `tsconfig.json` - TypeScript configuration

### 1.2 Environment Variables

You'll need to set these environment variables in Render:

```bash
# Required
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your_jwt_secret_here

# AI API Keys (at least one required)
GOOGLE_API_KEY=your_google_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Optional
NODE_ENV=production
PORT=10000
```

## Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. **Connect Repository**:
   - Go to your Render dashboard
   - Click "New +" → "Blueprint"
   - Connect your Git repository
   - Render will automatically detect the `render.yaml` file

2. **Configure Environment Variables**:
   - In the Render dashboard, go to your service
   - Navigate to "Environment" tab
   - Add all required environment variables

3. **Deploy**:
   - Render will automatically build and deploy your application
   - Monitor the build logs for any issues

### Option B: Manual Deployment

1. **Create Web Service**:
   - Go to Render dashboard
   - Click "New +" → "Web Service"
   - Connect your Git repository

2. **Configure Service**:
   ```
   Name: vsl-alchemist
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Set Environment Variables**:
   - Add all required environment variables
   - Save the configuration

4. **Deploy**:
   - Click "Create Web Service"
   - Monitor the deployment

## Step 3: Database Setup

### 3.1 Create PostgreSQL Database

1. **Create Database**:
   - Go to Render dashboard
   - Click "New +" → "PostgreSQL"
   - Name: `vsl-alchemist-db`
   - Plan: Starter (or higher for production)

2. **Get Connection String**:
   - Copy the internal database URL
   - Set it as `DATABASE_URL` environment variable

### 3.2 Initialize Database Schema

The application will automatically create tables on first run, but you can also run the schema manually:

```sql
-- Run this in your database
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS business_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  offer TEXT NOT NULL,
  avatar TEXT NOT NULL,
  problems TEXT NOT NULL,
  desires TEXT NOT NULL,
  tone VARCHAR(50) NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  business_profile_id INTEGER REFERENCES business_profiles(id),
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

## Step 4: Verify Deployment

### 4.1 Health Check

Your application includes a health check endpoint:

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

### 4.2 Test API Endpoints

```bash
# Test authentication
curl -X POST https://your-app-name.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test health check
curl https://your-app-name.onrender.com/health
```

## Step 5: Custom Domain (Optional)

1. **Add Custom Domain**:
   - Go to your service in Render dashboard
   - Click "Settings" → "Custom Domains"
   - Add your domain

2. **Configure DNS**:
   - Point your domain to Render's nameservers
   - Or add a CNAME record pointing to your Render URL

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for JWT token signing |
| `GOOGLE_API_KEY` | ⚠️ | Google AI API key (if using Gemini) |
| `OPENAI_API_KEY` | ⚠️ | OpenAI API key (if using GPT) |
| `NODE_ENV` | ❌ | Environment (default: production) |
| `PORT` | ❌ | Port (default: 10000) |

## Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Check build logs in Render dashboard
   # Ensure all dependencies are in package.json
   npm install
   npm run build
   ```

2. **Database Connection Issues**:
   ```bash
   # Verify DATABASE_URL is correct
   # Check if database is accessible
   # Ensure database schema is initialized
   ```

3. **API Key Issues**:
   ```bash
   # Verify API keys are set correctly
   # Check API key permissions
   # Test API keys locally first
   ```

4. **Port Issues**:
   ```bash
   # Render uses port 10000 by default
   # Ensure your app listens on process.env.PORT
   ```

### Debug Mode

Enable debug logging by adding to environment variables:

```bash
DEBUG=*
NODE_ENV=development
```

### Logs

View application logs in Render dashboard:
- Go to your service
- Click "Logs" tab
- Monitor real-time logs

## Performance Optimization

### 1. Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
```

### 2. Caching

Consider adding Redis for session storage:

```typescript
// Add Redis configuration
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);
```

### 3. CDN

For static assets, consider using a CDN:
- Upload static files to a CDN
- Update references in your application

## Security Considerations

### 1. Environment Variables

- ✅ Never commit API keys to Git
- ✅ Use Render's environment variable system
- ✅ Rotate secrets regularly

### 2. Database Security

- ✅ Use connection pooling
- ✅ Implement proper authentication
- ✅ Regular backups

### 3. API Security

- ✅ Rate limiting
- ✅ Input validation
- ✅ CORS configuration

## Monitoring

### 1. Health Checks

Your application includes automatic health checks:
- Endpoint: `/health`
- Checks database connectivity
- Returns application status

### 2. Logs

Monitor application logs in Render dashboard:
- Real-time log viewing
- Error tracking
- Performance monitoring

### 3. Metrics

Consider adding monitoring tools:
- Application performance monitoring
- Error tracking (Sentry)
- Uptime monitoring

## Cost Optimization

### 1. Render Plans

- **Free Tier**: Limited, good for testing
- **Starter**: $7/month, suitable for small apps
- **Standard**: $25/month, better performance
- **Pro**: $50/month, production ready

### 2. Database Plans

- **Starter**: $7/month, 1GB storage
- **Standard**: $25/month, 10GB storage
- **Pro**: $50/month, 50GB storage

### 3. Optimization Tips

- Use appropriate plan sizes
- Monitor usage regularly
- Optimize database queries
- Implement caching where possible

## Support

If you encounter issues:

1. **Check Render Documentation**: [docs.render.com](https://docs.render.com)
2. **View Application Logs**: In Render dashboard
3. **Test Locally**: Ensure app works locally first
4. **Contact Support**: Through Render dashboard

## Next Steps

After successful deployment:

1. **Set up monitoring** and alerting
2. **Configure backups** for your database
3. **Set up CI/CD** for automatic deployments
4. **Add SSL certificate** for custom domains
5. **Implement logging** and error tracking
6. **Set up staging environment** for testing 