#!/bin/bash

# Test Report Dashboard - Automated Test Suite
# This script tests the File Management System functionality

set -e  # Exit on any error

echo "🚀 Starting File Management System Test Suite"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:4200"
MAX_WAIT_TIME=30

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test results
print_test_result() {
    local test_name="$1"
    local status="$2"
    local message="$3"

    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $test_name - $message"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $test_name - $message"
        ((TESTS_FAILED++))
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url="$1"
    local service_name="$2"
    local max_attempts=$MAX_WAIT_TIME
    local attempt=1

    echo -e "${BLUE}⏳ Waiting for $service_name to be ready...${NC}"

    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi

        echo -e "${YELLOW}Attempt $attempt/$max_attempts - $service_name not ready yet...${NC}"
        sleep 1
        ((attempt++))
    done

    echo -e "${RED}❌ $service_name failed to start within $MAX_WAIT_TIME seconds${NC}"
    return 1
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint="$1"
    local expected_status="$2"
    local test_name="$3"

    local response=$(curl -s -w "%{http_code}" -o /dev/null "$BACKEND_URL$endpoint")

    if [ "$response" = "$expected_status" ]; then
        print_test_result "$test_name" "PASS" "HTTP $response"
    else
        print_test_result "$test_name" "FAIL" "Expected HTTP $expected_status, got HTTP $response"
    fi
}

# Function to test file download
test_download() {
    local path="$1"
    local test_name="$2"
    local output_file="test_download_$(date +%s).tmp"

    if curl -s -o "$output_file" "$BACKEND_URL/api/download?path=$path"; then
        if [ -f "$output_file" ] && [ -s "$output_file" ]; then
            print_test_result "$test_name" "PASS" "Download successful ($(wc -c < "$output_file") bytes)"
            rm -f "$output_file"
        else
            print_test_result "$test_name" "FAIL" "Download file is empty or missing"
        fi
    else
        print_test_result "$test_name" "FAIL" "Download request failed"
    fi
}

# Function to test JSON response
test_json_response() {
    local endpoint="$1"
    local test_name="$2"

    local response=$(curl -s "$BACKEND_URL$endpoint")

    if echo "$response" | jq . > /dev/null 2>&1; then
        print_test_result "$test_name" "PASS" "Valid JSON response"
    else
        print_test_result "$test_name" "FAIL" "Invalid JSON response"
    fi
}

echo -e "${BLUE}📋 Test Configuration:${NC}"
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "Max Wait Time: ${MAX_WAIT_TIME}s"
echo ""

# Test 1: Check if services are running
echo -e "${BLUE}🔍 Test 1: Service Health Checks${NC}"
echo "----------------------------------------"

if wait_for_service "$BACKEND_URL/api/health" "Backend Service"; then
    print_test_result "Backend Health Check" "PASS" "Backend is running"
else
    print_test_result "Backend Health Check" "FAIL" "Backend is not running"
    echo -e "${RED}❌ Cannot proceed with tests - Backend is not available${NC}"
    exit 1
fi

if wait_for_service "$FRONTEND_URL" "Frontend Service"; then
    print_test_result "Frontend Health Check" "PASS" "Frontend is running"
else
    print_test_result "Frontend Health Check" "FAIL" "Frontend is not running"
fi

echo ""

# Test 2: API Endpoint Tests
echo -e "${BLUE}🔍 Test 2: API Endpoint Tests${NC}"
echo "------------------------------------"

test_api_endpoint "/api/health" "200" "Health Check Endpoint"
test_api_endpoint "/api/system" "200" "System Info Endpoint"
test_api_endpoint "/api/list" "200" "List Directory Endpoint"
test_api_endpoint "/api/list?path=/static-files" "200" "List Static Files Directory"

echo ""

# Test 3: JSON Response Validation
echo -e "${BLUE}🔍 Test 3: JSON Response Validation${NC}"
echo "----------------------------------------"

# Check if jq is available
if command -v jq > /dev/null 2>&1; then
    test_json_response "/api/health" "Health Check JSON"
    test_json_response "/api/system" "System Info JSON"
    test_json_response "/api/list" "Directory List JSON"
else
    echo -e "${YELLOW}⚠️  jq not found - skipping JSON validation tests${NC}"
fi

echo ""

# Test 4: File Download Tests
echo -e "${BLUE}🔍 Test 4: File Download Tests${NC}"
echo "------------------------------------"

# Test downloading a file
test_download "/static-files/data/metrics.csv" "File Download Test"

# Test downloading a directory (should be a zip)
test_download "/static-files" "Directory Download Test"

echo ""

# Test 5: Navigation Tests
echo -e "${BLUE}🔍 Test 5: Navigation Tests${NC}"
echo "----------------------------"

# Test root directory listing
if curl -s "$BACKEND_URL/api/list" | grep -q "static-files"; then
    print_test_result "Root Directory Navigation" "PASS" "Root directory contains expected items"
else
    print_test_result "Root Directory Navigation" "FAIL" "Root directory missing expected items"
fi

# Test subdirectory navigation
if curl -s "$BACKEND_URL/api/list?path=/static-files" | grep -q "data"; then
    print_test_result "Subdirectory Navigation" "PASS" "Subdirectory contains expected items"
else
    print_test_result "Subdirectory Navigation" "FAIL" "Subdirectory missing expected items"
fi

echo ""

# Test 6: Error Handling Tests
echo -e "${BLUE}🔍 Test 6: Error Handling Tests${NC}"
echo "------------------------------------"

# Test invalid path
test_api_endpoint "/api/list?path=/nonexistent" "500" "Invalid Path Handling"

# Test file content endpoint
test_api_endpoint "/api/file?path=/static-files/data/metrics.csv" "200" "File Content Endpoint"

echo ""

# Test 7: Performance Tests
echo -e "${BLUE}🔍 Test 7: Performance Tests${NC}"
echo "--------------------------------"

# Test response time for health check
start_time=$(date +%s%N)
curl -s "$BACKEND_URL/api/health" > /dev/null
end_time=$(date +%s%N)
response_time=$(( (end_time - start_time) / 1000000 ))

if [ $response_time -lt 1000 ]; then
    print_test_result "Response Time Test" "PASS" "Health check responded in ${response_time}ms"
else
    print_test_result "Response Time Test" "FAIL" "Health check took too long: ${response_time}ms"
fi

echo ""

# Test 8: Data Integrity Tests
echo -e "${BLUE}🔍 Test 8: Data Integrity Tests${NC}"
echo "------------------------------------"

# Check if static files are properly created
if curl -s "$BACKEND_URL/api/list" | grep -q "static-files"; then
    print_test_result "Data Integrity" "PASS" "Static files directory exists"
else
    print_test_result "Data Integrity" "FAIL" "Static files directory missing"
fi

echo ""

# Final Results
echo -e "${BLUE}📊 Test Results Summary${NC}"
echo "=========================="
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! The File Management System is working correctly.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please check the output above for details.${NC}"
    exit 1
fi
