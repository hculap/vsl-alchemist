# Render Production Setup with Docker PostgreSQL

This guide shows you how to deploy VSL-Alchemist on Render with Docker containers for both the application and PostgreSQL database.

## 🚀 **Quick Setup (Recommended)**

### **Option 1: Using Render Blueprint**

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
   POSTGRES_PASSWORD=your_secure_database_password
   JWT_SECRET=your_very_secure_jwt_secret_here
   GOOGLE_API_KEY=your_google_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Deploy**
   - Render will automatically create both the app and database
   - Monitor the deployment logs

### **Option 2: Manual Setup**

#### **Step 1: Create Web Service**

1. **Go to Render Dashboard**
   - Click "New +" → "Web Service"

2. **Configure Service**
   ```
   Name: vsl-alchemist
   Environment: Docker
   Dockerfile Path: ./Dockerfile
   Docker Context: .
   Docker Command: docker-compose -f render-docker-compose.yml up --build -d
   ```

3. **Set Environment Variables**
   ```bash
   POSTGRES_PASSWORD=your_secure_database_password
   JWT_SECRET=your_very_secure_jwt_secret_here
   GOOGLE_API_KEY=your_google_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   NODE_ENV=production
   PORT=10000
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Monitor the deployment

## 📁 **File Structure**

```
vsl-alchemist/
├── render.yaml                    # Render blueprint configuration
├── render-docker-compose.yml      # Production Docker Compose
├── docker-compose.yml             # Development Docker Compose
├── Dockerfile                     # Multi-stage build
├── database/
│   └── init.sql                  # Database initialization
└── src/                          # Application source code
```

## 🔧 **Configuration Details**

### **Docker Compose for Production**

The `render-docker-compose.yml` file:

```yaml
services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: vsl_alchemist
      POSTGRES_USER: vsl_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql

  # Application
  app:
    build:
      context: .
      target: production
    environment:
      - DATABASE_URL=postgresql://vsl_user:${POSTGRES_PASSWORD}@postgres:5432/vsl_alchemist
      - JWT_SECRET=${JWT_SECRET}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    ports:
      - "10000:10000"
    depends_on:
      postgres:
        condition: service_healthy
```

### **Environment Variables**

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_PASSWORD` | ✅ | Database password |
| `JWT_SECRET` | ✅ | JWT token signing secret |
| `GOOGLE_API_KEY` | ⚠️ | Google AI API key |
| `OPENAI_API_KEY` | ⚠️ | OpenAI API key |
| `NODE_ENV` | ❌ | Environment (default: production) |
| `PORT` | ❌ | Port (default: 10000) |

## 🧪 **Testing Your Deployment**

### **1. Health Check**
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

### **2. API Info**
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

### **3. Test Database Connection**
```bash
# Register a user (this will create tables)
curl -X POST https://your-app-name.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Expected response:
```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

## 🔍 **Monitoring and Debugging**

### **View Logs**
- Go to your service in Render dashboard
- Click "Logs" tab
- Monitor real-time logs

### **Database Access**
```bash
# Connect to database (if needed)
docker-compose exec postgres psql -U vsl_user -d vsl_alchemist

# Run SQL queries
docker-compose exec postgres psql -U vsl_user -d vsl_alchemist -c "SELECT * FROM users;"
```

### **Health Checks**
```bash
# Application health
curl https://your-app-name.onrender.com/health

# Database health (from within container)
docker-compose exec postgres pg_isready -U vsl_user -d vsl_alchemist
```

## 🔒 **Security Considerations**

### **Database Security**
- ✅ Database port not exposed externally
- ✅ Strong password required
- ✅ Internal Docker networking
- ✅ Automatic backups (Render feature)

### **Application Security**
- ✅ Non-root user in containers
- ✅ Environment variables for secrets
- ✅ Health checks for monitoring
- ✅ SSL/TLS encryption (Render handles)

## 📊 **Performance Optimization**

### **Resource Limits**
```yaml
# Add to render-docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
  
  postgres:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.25'
```

### **Database Optimization**
```sql
-- Add performance indexes
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX idx_business_profiles_created_at ON business_profiles(created_at);

-- Analyze tables
ANALYZE users;
ANALYZE business_profiles;
ANALYZE campaigns;
```

## 🔄 **Backup and Recovery**

### **Automatic Backups**
Render provides automatic backups for PostgreSQL:
- Daily backups
- 7-day retention (Starter plan)
- 30-day retention (Standard plan)

### **Manual Backups**
```bash
# Export database
docker-compose exec postgres pg_dump -U vsl_user vsl_alchemist > backup.sql

# Import database
docker-compose exec -T postgres psql -U vsl_user -d vsl_alchemist < backup.sql
```

## 💰 **Cost Optimization**

### **Render Plans**
- **Starter**: $7/month (suitable for development)
- **Standard**: $25/month (better performance)
- **Pro**: $50/month (production ready)

### **Database Plans**
- **Starter**: $7/month, 1GB storage
- **Standard**: $25/month, 10GB storage
- **Pro**: $50/month, 50GB storage

## 🐛 **Troubleshooting**

### **Common Issues**

1. **"Database connection failed"**
   ```bash
   # Check if database container is running
   docker-compose ps
   
   # Check database logs
   docker-compose logs postgres
   
   # Verify environment variables
   echo $POSTGRES_PASSWORD
   ```

2. **"Port already in use"**
   ```bash
   # Check what's using the port
   lsof -i :10000
   
   # Change port in render-docker-compose.yml
   ports:
     - "10001:10000"
   ```

3. **"Build failed"**
   ```bash
   # Check Docker build logs
   docker-compose build --no-cache
   
   # Verify Dockerfile syntax
   docker build -t test .
   ```

### **Debug Mode**
```bash
# Run with debug logging
docker-compose -f render-docker-compose.yml run --rm app npm run dev

# Access container shell
docker-compose exec app sh
docker-compose exec postgres bash
```

## 🚀 **Deployment Commands**

### **Local Testing**
```bash
# Test locally before deploying
docker-compose -f render-docker-compose.yml up --build

# Test with production environment
POSTGRES_PASSWORD=test123 JWT_SECRET=test123 docker-compose -f render-docker-compose.yml up --build
```

### **Production Deployment**
```bash
# Deploy to Render (automatic with Git push)
git add .
git commit -m "Update production configuration"
git push origin main
```

## 📚 **Additional Resources**

- [Render Documentation](https://docs.render.com)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Node.js Docker Image](https://hub.docker.com/_/node)

## 🆘 **Support**

If you encounter issues:

1. **Check Render Logs**: In Render dashboard
2. **Test Locally**: Use `docker-compose -f render-docker-compose.yml up`
3. **Verify Configuration**: Check environment variables
4. **Contact Support**: Through Render dashboard

## 🎯 **Next Steps**

After successful deployment:

1. **Test all API endpoints**
2. **Set up monitoring and alerting**
3. **Configure custom domain**
4. **Set up CI/CD pipeline**
5. **Implement logging and error tracking** 