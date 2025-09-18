#!/bin/bash

# SecureInsure Pro Health Check Script
echo "🔍 Checking SecureInsure Pro Services..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=$3
    
    echo -n "Checking $service_name... "
    
    if curl -s -f "$url" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check database
check_database() {
    echo -n "Checking Database... "
    
    if psql -h localhost -U postgres -d secureinsure_policy -c "SELECT 1;" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check ExamOne integration
check_examone() {
    echo -n "Checking ExamOne Integration... "
    
    response=$(curl -s -X POST http://localhost:8082/api/v1/examone/lab-request \
        -H "Content-Type: application/json" \
        -d '{"caseId":"test"}' 2>/dev/null)
    
    if echo "$response" | grep -q "requestId"; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  STUB RESPONSE${NC}"
        return 1
    fi
}

# Main health check
echo ""
echo "📊 Database Status:"
check_database

echo ""
echo "🔐 Auth Service (Port 8081):"
check_service "Auth Service" "http://localhost:8081/api/v1/auth/health"

echo ""
echo "📋 Policy Service (Port 8082):"
check_service "Policy Service" "http://localhost:8082/api/v1/policies/health"

echo ""
echo "💰 Claims Service (Port 8083):"
check_service "Claims Service" "http://localhost:8083/api/v1/claims/health"

echo ""
echo "🎨 Frontend (Port 3000):"
check_service "Frontend" "http://localhost:3000"

echo ""
echo "🧪 ExamOne Integration:"
check_examone

echo ""
echo "========================================"
echo "Health check completed!"

# Check if all services are running
if check_database && \
   check_service "Auth Service" "http://localhost:8081/api/v1/auth/health" && \
   check_service "Policy Service" "http://localhost:8082/api/v1/policies/health" && \
   check_service "Claims Service" "http://localhost:8083/api/v1/claims/health" && \
   check_service "Frontend" "http://localhost:3000"; then
    echo -e "${GREEN}🎉 All services are running!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some services are not running. Check the logs above.${NC}"
    exit 1
fi
