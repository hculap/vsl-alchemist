#!/bin/bash

# VSL-Alchemist Docker Deployment Script
# This script helps deploy the application with PostgreSQL using Docker Compose

set -e

echo "🐳 VSL-Alchemist Docker Deployment Script"
echo "========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found. Please run this script from the project root."
    exit 1
fi

# Check if required files exist
echo "📋 Checking required files..."

required_files=(
    "docker-compose.yml"
    "Dockerfile"
    "package.json"
    "database/init.sql"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - MISSING"
        exit 1
    fi
done

# Set environment variables if not set
if [ -z "$GOOGLE_API_KEY" ]; then
    echo "⚠️  GOOGLE_API_KEY not set. You can set it in docker-compose.yml or as an environment variable."
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not set. You can set it in docker-compose.yml or as an environment variable."
fi

# Build and start the services
echo ""
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL..."
if docker-compose exec -T postgres pg_isready -U vsl_user -d vsl_alchemist > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL is not ready yet. Waiting..."
    sleep 10
    if docker-compose exec -T postgres pg_isready -U vsl_user -d vsl_alchemist > /dev/null 2>&1; then
        echo "✅ PostgreSQL is now running"
    else
        echo "❌ PostgreSQL failed to start"
        docker-compose logs postgres
        exit 1
    fi
fi

# Check if application is running
echo "🔍 Checking application..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Application is running"
else
    echo "❌ Application is not ready yet. Waiting..."
    sleep 10
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Application is now running"
    else
        echo "❌ Application failed to start"
        docker-compose logs app
        exit 1
    fi
fi

# Show service status
echo ""
echo "📊 Service Status:"
docker-compose ps

# Show logs
echo ""
echo "📋 Recent logs:"
docker-compose logs --tail=20

echo ""
echo "🎉 Deployment successful!"
echo ""
echo "📋 Service URLs:"
echo "🌐 Application: http://localhost:3000"
echo "🔍 Health Check: http://localhost:3000/health"
echo "🗄️  PostgreSQL: localhost:5432"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart services: docker-compose restart"
echo "  View database: docker-compose exec postgres psql -U vsl_user -d vsl_alchemist"
echo ""
echo "🔑 Database credentials:"
echo "  Database: vsl_alchemist"
echo "  Username: vsl_user"
echo "  Password: vsl_password"
echo "  Connection: postgresql://vsl_user:vsl_password@localhost:5432/vsl_alchemist" 