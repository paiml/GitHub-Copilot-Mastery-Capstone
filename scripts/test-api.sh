#!/usr/bin/env bash
#
# Invoice Reconciliation API Test Script
# Tests all API endpoints step-by-step as documented in docs/tdd-demo.md
#
# Usage: ./scripts/test-api.sh
#
# bashrs validation: Run with `bashrs lint scripts/test-api.sh`

set -euo pipefail

# Configuration
readonly BASE_URL="${BASE_URL:-http://localhost:9001}"
readonly TEST_OUTPUT_DIR="test-results"
readonly TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# Counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

#######################################
# Print colored message
# Arguments:
#   $1 - Color code
#   $2 - Message
#######################################
print_message() {
    local color="$1"
    local message="$2"
    echo -e "${color}${message}${NC}"
}

#######################################
# Log test result
# Arguments:
#   $1 - Test name
#   $2 - Result (PASS/FAIL)
#   $3 - Optional details
#######################################
log_result() {
    local test_name="$1"
    local result="$2"
    local details="${3:-}"

    TESTS_RUN=$((TESTS_RUN + 1))

    if [[ "$result" == "PASS" ]]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        print_message "$GREEN" "✓ $test_name"
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        print_message "$RED" "✗ $test_name"
        if [[ -n "$details" ]]; then
            echo "  Details: $details"
        fi
    fi
}

#######################################
# Test if server is running
#######################################
test_server_running() {
    print_message "$YELLOW" "\n=== Testing Server Connection ==="

    if curl -sf "${BASE_URL}/health" > /dev/null 2>&1; then
        log_result "Server is running at ${BASE_URL}" "PASS"
        return 0
    else
        log_result "Server is running at ${BASE_URL}" "FAIL" "Server not responding"
        return 1
    fi
}

#######################################
# Test health endpoint
#######################################
test_health_endpoint() {
    print_message "$YELLOW" "\n=== Testing Health Endpoint ==="

    local response
    response=$(curl -s "${BASE_URL}/health")

    # Check if response contains expected fields
    if echo "$response" | jq -e '.status == "healthy"' > /dev/null 2>&1; then
        log_result "GET /health returns healthy status" "PASS"
    else
        log_result "GET /health returns healthy status" "FAIL" "$response"
    fi

    if echo "$response" | jq -e '.version' > /dev/null 2>&1; then
        log_result "GET /health includes version" "PASS"
    else
        log_result "GET /health includes version" "FAIL"
    fi
}

#######################################
# Test create invoice endpoint
#######################################
test_create_invoice() {
    print_message "$YELLOW" "\n=== Testing Create Invoice ==="

    local response
    local http_code
    local invoice_payload='{"invoiceNumber":"INV-202401","date":"2024-01-15T10:00:00Z","dueDate":"2024-02-15T10:00:00Z","supplier":{"id":"550e8400-e29b-41d4-a716-446655440000","name":"Acme Corporation","taxId":"12-3456789"},"currency":"USD","lineItems":[{"id":"660e8400-e29b-41d4-a716-446655440001","description":"Professional Services - Software Development","quantity":10,"unitPrice":{"amount":125.00,"currency":"USD"},"total":{"amount":1250.00,"currency":"USD"}}],"total":{"amount":1250.00,"currency":"USD"}}'

    response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/v1/invoices" \
        -H "Content-Type: application/json" \
        -d "$invoice_payload")

    http_code=$(echo "$response" | tail -n1)
    response=$(echo "$response" | sed '$d')

    if [[ "$http_code" == "201" ]] || [[ "$http_code" == "200" ]]; then
        log_result "POST /api/v1/invoices returns success" "PASS"
    else
        log_result "POST /api/v1/invoices returns success" "FAIL" "HTTP $http_code"
    fi

    # Save invoice ID for later tests
    if echo "$response" | jq -e '.id' > /dev/null 2>&1; then
        INVOICE_ID=$(echo "$response" | jq -r '.id')
        log_result "Created invoice has ID" "PASS"
    else
        log_result "Created invoice has ID" "FAIL"
    fi
}

#######################################
# Test list invoices endpoint
#######################################
test_list_invoices() {
    print_message "$YELLOW" "\n=== Testing List Invoices ==="

    local response
    response=$(curl -s "${BASE_URL}/api/v1/invoices")

    if echo "$response" | jq -e '. | type == "array"' > /dev/null 2>&1; then
        log_result "GET /api/v1/invoices returns array" "PASS"
    else
        log_result "GET /api/v1/invoices returns array" "FAIL"
    fi

    if echo "$response" | jq -e '. | length > 0' > /dev/null 2>&1; then
        log_result "GET /api/v1/invoices returns at least one invoice" "PASS"
    else
        log_result "GET /api/v1/invoices returns at least one invoice" "FAIL"
    fi
}

#######################################
# Test get invoice by ID
#######################################
test_get_invoice_by_id() {
    print_message "$YELLOW" "\n=== Testing Get Invoice by ID ==="

    if [[ -z "${INVOICE_ID:-}" ]]; then
        log_result "GET /api/v1/invoices/{id}" "FAIL" "No invoice ID available"
        return 1
    fi

    local response
    local http_code
    response=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/v1/invoices/${INVOICE_ID}")

    http_code=$(echo "$response" | tail -n1)
    response=$(echo "$response" | sed '$d')

    if [[ "$http_code" == "200" ]]; then
        log_result "GET /api/v1/invoices/{id} returns 200" "PASS"
    else
        log_result "GET /api/v1/invoices/{id} returns 200" "FAIL" "HTTP $http_code"
    fi

    if echo "$response" | jq -e ".id == \"${INVOICE_ID}\"" > /dev/null 2>&1; then
        log_result "Retrieved invoice has correct ID" "PASS"
    else
        log_result "Retrieved invoice has correct ID" "FAIL"
    fi
}

#######################################
# Test validation - invalid invoice number
#######################################
test_validation_invalid_invoice_number() {
    print_message "$YELLOW" "\n=== Testing Validation - Invalid Invoice Number ==="

    local response
    local http_code
    local invalid_payload='{"invoiceNumber":"INVALID","date":"2024-01-15T10:00:00Z","dueDate":"2024-02-15T10:00:00Z","supplier":{"id":"550e8400-e29b-41d4-a716-446655440000","name":"Acme Corp"},"currency":"USD","lineItems":[{"id":"660e8400-e29b-41d4-a716-446655440001","description":"Test","quantity":1,"unitPrice":{"amount":100.00,"currency":"USD"},"total":{"amount":100.00,"currency":"USD"}}],"total":{"amount":100.00,"currency":"USD"}}'

    response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/v1/invoices" \
        -H "Content-Type: application/json" \
        -d "$invalid_payload")

    http_code=$(echo "$response" | tail -n1)
    response=$(echo "$response" | sed '$d')

    if [[ "$http_code" == "400" ]]; then
        log_result "POST invalid invoice returns 400" "PASS"
    else
        log_result "POST invalid invoice returns 400" "FAIL" "HTTP $http_code"
    fi

    if echo "$response" | jq -e '.status == 400' > /dev/null 2>&1; then
        log_result "Error response includes status 400" "PASS"
    else
        log_result "Error response includes status 400" "FAIL"
    fi
}

#######################################
# Test API documentation endpoints
#######################################
test_api_documentation() {
    print_message "$YELLOW" "\n=== Testing API Documentation ==="

    local response
    response=$(curl -s "${BASE_URL}/api/docs")

    if echo "$response" | jq -e '.openapi' > /dev/null 2>&1; then
        log_result "GET /api/docs returns OpenAPI spec" "PASS"
    else
        log_result "GET /api/docs returns OpenAPI spec" "FAIL"
    fi

    local swagger_response
    swagger_response=$(curl -s "${BASE_URL}/api/swagger")

    if echo "$swagger_response" | grep -q "swagger-ui"; then
        log_result "GET /api/swagger returns Swagger UI" "PASS"
    else
        log_result "GET /api/swagger returns Swagger UI" "FAIL"
    fi
}

#######################################
# Test index page
#######################################
test_index_page() {
    print_message "$YELLOW" "\n=== Testing Index Page ==="

    local response
    response=$(curl -s "${BASE_URL}/")

    if echo "$response" | grep -q "Invoice Reconciliation Engine"; then
        log_result "GET / returns index page" "PASS"
    else
        log_result "GET / returns index page" "FAIL"
    fi
}

#######################################
# Print final summary
#######################################
print_summary() {
    print_message "$YELLOW" "\n=========================================="
    print_message "$YELLOW" "TEST SUMMARY"
    print_message "$YELLOW" "=========================================="
    echo "Total tests run:    $TESTS_RUN"
    print_message "$GREEN" "Tests passed:       $TESTS_PASSED"
    print_message "$RED" "Tests failed:       $TESTS_FAILED"

    local pass_rate=0
    if [[ $TESTS_RUN -gt 0 ]]; then
        pass_rate=$((TESTS_PASSED * 100 / TESTS_RUN))
    fi
    echo "Pass rate:          ${pass_rate}%"
    print_message "$YELLOW" "=========================================="

    if [[ $TESTS_FAILED -eq 0 ]]; then
        print_message "$GREEN" "\n✓ All tests passed!"
        return 0
    else
        print_message "$RED" "\n✗ Some tests failed"
        return 1
    fi
}

#######################################
# Main execution
#######################################
main() {
    print_message "$GREEN" "=========================================="
    print_message "$GREEN" "Invoice Reconciliation API Tests"
    print_message "$GREEN" "=========================================="
    print_message "$YELLOW" "Base URL: $BASE_URL"
    print_message "$YELLOW" "Timestamp: $TIMESTAMP"
    echo

    # Run tests
    test_server_running || exit 1
    test_health_endpoint
    test_create_invoice
    test_list_invoices
    test_get_invoice_by_id
    test_validation_invalid_invoice_number
    test_api_documentation
    test_index_page

    # Print summary
    print_summary
}

# Execute main function
main "$@"
