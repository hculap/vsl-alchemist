# Docker Deployment Guide for VSL-Alchemist

This guide explains how to deploy VSL-Alchemist with PostgreSQL using Docker containers on the same instance.

## 🐳 Overview

This setup runs both the VSL-Alchemist application and PostgreSQL database in separate Docker containers on the same host, providing:

- ✅ **Self-contained deployment** - Everything runs in containers
- ✅ **Easy setup** - One command to start everything
- ✅ **Development-friendly** - Perfect for local development
- ✅ **Production-ready** - Can be deployed to any Docker host
- ✅ **Data persistence** - PostgreSQL data is stored in Docker volumes

## 📋 Prerequisites

1. **Docker**: Install Docker Desktop or Docker Engine
2. **Docker Compose**: Usually included with Docker Desktop
3. **Git**: To clone the repository

## 🚀 Quick Start

### 1. Clone and Navigate
```bash
git clone <your-repo-url>
cd vsl-alchemist
```

### 2. Set Environment Variables
```bash
# Set your API keys (optional for testing)
export GOOGLE_API_KEY=your_google_api_key_here
export OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Deploy with Docker Compose
```bash
# Use the deployment script
./scripts/docker-deploy.sh

# Or manually
docker-compose up --build -d
```

### 4. Verify Deployment
```bash
# Check service status
docker-compose ps

# Test health endpoint
curl http://localhost:3000/health

# View logs
docker-compose logs -f
```

## 📁 File Structure

```
vsl-alchemist/
├── docker-compose.yml          # Multi-container setup
├── Dockerfile                  # Application container
├── .dockerignore              # Files to exclude
├── database/
│   └── init.sql              # Database initialization
├── scripts/
│   └── docker-deploy.sh      # Deployment script
└── src/                      # Application source code
```

## 🔧 Configuration

### Docker Compose Services

#### PostgreSQL Service
```yaml
postgres:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: vsl_alchemist
    POSTGRES_USER: vsl_user
    POSTGRES_PASSWORD: vsl_password
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
```

#### Application Service
```yaml
app:
  build: .
  environment:
    - DATABASE_URL=postgresql://vsl_user:vsl_password@postgres:5432/vsl_alchemist
    - JWT_SECRET=your_jwt_secret_here
    - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    - OPENAI_API_KEY=${OPENAI_API_KEY}
  ports:
    - "3000:3000"
  depends_on:
    postgres:
      condition: service_healthy
```

## 🗄️ Database Setup

### Automatic Initialization

The database is automatically initialized when the PostgreSQL container starts:

1. **Database Creation**: Creates `vsl_alchemist` database
2. **Table Creation**: Creates all required tables
3. **Index Creation**: Adds performance indexes
4. **User Setup**: Creates application user with proper permissions

### Database Schema

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

## 🔍 Monitoring and Debugging

### Health Checks

Both services include health checks:

```bash
# Application health check
curl http://localhost:3000/health

# PostgreSQL health check
docker-compose exec postgres pg_isready -U vsl_user -d vsl_alchemist
```

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f postgres

# View recent logs
docker-compose logs --tail=50
```

### Database Access

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U vsl_user -d vsl_alchemist

# Run SQL queries
docker-compose exec postgres psql -U vsl_user -d vsl_alchemist -c "SELECT * FROM users;"

# Backup database
docker-compose exec postgres pg_dump -U vsl_user vsl_alchemist > backup.sql
```

## 🔧 Management Commands

### Start Services
```bash
# Start in background
docker-compose up -d

# Start with logs
docker-compose up

# Rebuild and start
docker-compose up --build -d
```

### Stop Services
```bash
# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart app
docker-compose restart postgres
```

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up --build -d
```

## 🔒 Security Considerations

### Environment Variables

```bash
# Create .env file for sensitive data
cat > .env << EOF
GOOGLE_API_KEY=your_google_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_very_secure_jwt_secret_here
EOF

# Load environment variables
source .env
```

### Database Security

```bash
# Change default passwords
POSTGRES_PASSWORD=your_secure_password_here
JWT_SECRET=your_very_secure_jwt_secret_here
```

### Network Security

```bash
# Use internal Docker network (default)
# External access only through application port 3000
# Database port 5432 should not be exposed in production
```

## 📊 Performance Optimization

### Resource Limits

Add to `docker-compose.yml`:

```yaml
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

### Database Optimization

```sql
-- Add more indexes for better performance
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX idx_business_profiles_created_at ON business_profiles(created_at);

-- Analyze tables for query optimization
ANALYZE users;
ANALYZE business_profiles;
ANALYZE campaigns;
```

## 🚀 Production Deployment

### 1. Single Server Deployment

```bash
# Clone repository
git clone <your-repo-url>
cd vsl-alchemist

# Set production environment variables
export NODE_ENV=production
export GOOGLE_API_KEY=your_production_key
export OPENAI_API_KEY=your_production_key
export JWT_SECRET=your_very_secure_secret

# Deploy
docker-compose -f docker-compose.yml up -d
```

### 2. Multi-Server Deployment

For high availability, deploy to multiple servers:

```bash
# Server 1: Application
docker-compose up app -d

# Server 2: Database (with external volume)
docker-compose up postgres -d
```

### 3. Load Balancer Setup

```yaml
# nginx.conf
upstream vsl_alchemist {
    server server1:3000;
    server server2:3000;
    server server3:3000;
}

server {
    listen 80;
    location / {
        proxy_pass http://vsl_alchemist;
    }
}
```

## 🔄 Backup and Recovery

### Database Backup

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec postgres pg_dump -U vsl_user vsl_alchemist > backup_$DATE.sql
echo "Backup created: backup_$DATE.sql"
EOF

chmod +x backup.sh
./backup.sh
```

### Database Restore

```bash
# Restore from backup
docker-compose exec -T postgres psql -U vsl_user -d vsl_alchemist < backup_20240101_120000.sql
```

### Volume Backup

```bash
# Backup Docker volumes
docker run --rm -v vsl-alchemist_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_data_$(date +%Y%m%d).tar.gz -C /data .
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :5432
   
   # Change ports in docker-compose.yml
   ports:
     - "3001:3000"  # Use different external port
   ```

2. **Database Connection Issues**:
   ```bash
   # Check if PostgreSQL is running
   docker-compose exec postgres pg_isready
   
   # Check logs
   docker-compose logs postgres
   ```

3. **Application Startup Issues**:
   ```bash
   # Check application logs
   docker-compose logs app
   
   # Check if database is ready
   docker-compose exec app npm run test:db
   ```

4. **Memory Issues**:
   ```bash
   # Check resource usage
   docker stats
   
   # Increase memory limits
   deploy:
     resources:
       limits:
         memory: 2G
   ```

### Debug Mode

```bash
# Run with debug logging
docker-compose run --rm app npm run dev

# Access container shell
docker-compose exec app sh
docker-compose exec postgres bash
```

## 📈 Scaling

### Horizontal Scaling

```bash
# Scale application instances
docker-compose up --scale app=3 -d

# Use load balancer
docker-compose up nginx -d
```

### Vertical Scaling

```bash
# Increase resources in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '1.0'
```

## 🔧 Development Workflow

### Local Development

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Make changes and rebuild
docker-compose up --build -d

# Run tests
docker-compose exec app npm test
```

### Hot Reload

For development with hot reload:

```yaml
# docker-compose.dev.yml
services:
  app:
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev
```

```bash
# Use development compose
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Node.js Docker Image](https://hub.docker.com/_/node)

## 🆘 Support

If you encounter issues:

1. **Check logs**: `docker-compose logs`
2. **Verify configuration**: Check `docker-compose.yml`
3. **Test connectivity**: Use health check endpoints
4. **Review documentation**: See `RENDER_DEPLOYMENT.md` for alternative deployment options 