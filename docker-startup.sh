#!/bin/bash

# SecureInsure Pro Docker Startup Script
# This script builds and starts the complete application stack

echo "🚀 Starting SecureInsure Pro Application Stack"
echo "================================================"

# Clean up any existing containers and volumes
echo "📦 Cleaning up existing containers and volumes..."
docker-compose down -v
docker system prune -f

echo "🔧 Building and starting infrastructure services..."
# Start infrastructure services first
docker-compose up -d postgres redis elasticsearch

echo "⏳ Waiting for infrastructure to be ready..."
sleep 30

echo "🏗️ Building and starting all services..."
# Build and start all services
docker-compose up --build -d

echo "📊 Checking service status..."
sleep 10
docker-compose ps

echo "🔍 Monitoring logs for startup..."
echo "You can monitor logs with: docker-compose logs -f"

echo "✅ Application should be available at:"
echo "   Frontend: http://localhost:3000"
echo "   API Gateway: http://localhost:8080"
echo "   Swagger UI: http://localhost:8080/swagger-ui.html"

echo "🔄 Use 'docker-compose logs -f [service-name]' to monitor specific services"
echo "🛑 Use 'docker-compose down' to stop all services"