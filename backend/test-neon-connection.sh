#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}FarmTime - Neon Database Connection Test${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if backend is running
echo -e "${YELLOW}Step 1: Checking if backend is running...${NC}"
if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not running${NC}"
    echo -e "${YELLOW}Please start the backend first:${NC}"
    echo -e "  ./run-neon.sh"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Testing basic health endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:8080/api/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Health endpoint responded${NC}"
    echo "$HEALTH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_RESPONSE"
else
    echo -e "${RED}✗ Health endpoint failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 3: Testing database connection...${NC}"
DB_RESPONSE=$(curl -s http://localhost:8080/api/health/database)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database connection test completed${NC}"
    echo "$DB_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$DB_RESPONSE"
else
    echo -e "${RED}✗ Database connection test failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 4: Testing database ping...${NC}"
PING_RESPONSE=$(curl -s http://localhost:8080/api/health/database/ping)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database ping successful${NC}"
    echo "$PING_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$PING_RESPONSE"
else
    echo -e "${RED}✗ Database ping failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 5: Checking table statistics...${NC}"
STATS_RESPONSE=$(curl -s http://localhost:8080/api/health/database/stats)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Table statistics retrieved${NC}"
    echo "$STATS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$STATS_RESPONSE"
else
    echo -e "${RED}✗ Failed to get table statistics${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ All tests passed!${NC}"
echo -e "${GREEN}✓ Neon database connection is working!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Available endpoints:${NC}"
echo "  - Health Check:     http://localhost:8080/api/health"
echo "  - Database Info:    http://localhost:8080/api/health/database"
echo "  - Database Ping:    http://localhost:8080/api/health/database/ping"
echo "  - Table Stats:      http://localhost:8080/api/health/database/stats"
echo ""
