#!/bin/bash

# SecureInsure Pro Docker Test Script
# This script tests all services are running properly

echo "🧪 Testing SecureInsure Pro Application Stack"
echo "============================================="

echo "📊 Checking service status..."
docker-compose ps

echo ""
echo "🔍 Testing service health endpoints..."

# Test infrastructure
echo "Testing PostgreSQL..."
docker exec secureinsure-postgres pg_isready -U postgres

echo "Testing Redis..."
docker exec secureinsure-redis redis-cli ping

echo "Testing Elasticsearch..."
curl -s http://localhost:9200/_cluster/health | jq '.status' || echo "Elasticsearch not ready"

echo ""
echo "🔍 Testing application services..."

# Test backend services
services=("8080:gateway" "8081:auth" "8082:policy" "8083:claims" "8084:notification" "8085:admin" "8086:search")

for service in "${services[@]}"; do
  port="${service%%:*}"
  name="${service##*:}"
  echo "Testing $name service on port $port..."
  response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/actuator/health)
  if [ "$response" = "200" ]; then
    echo "✅ $name service: OK"
  else
    echo "❌ $name service: Failed (HTTP $response)"
  fi
done

echo ""
echo "🌐 Testing frontend..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$response" = "200" ]; then
  echo "✅ Frontend: OK"
else
  echo "❌ Frontend: Failed (HTTP $response)"
fi

echo ""
echo "🔗 Testing API routing through gateway..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/v1/auth/health)
if [ "$response" = "200" ]; then
  echo "✅ API routing: OK"
else
  echo "❌ API routing: Failed (HTTP $response)"
fi

echo ""
echo "📝 Complete test results above. Check logs for any failed services:"
echo "   docker-compose logs [service-name]"