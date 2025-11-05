# API Design

## Base URL

```
http://localhost:8000/api/v1
```

## Endpoints

### Health Check

#### GET /health
Returns server health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-05T12:00:00.000Z",
  "version": "1.0.0"
}
```

### Invoices

#### POST /api/v1/invoices
Create a new invoice.

**Request:**
```json
{
  "invoiceNumber": "INV-123456",
  "date": "2025-11-05T12:00:00.000Z",
  "dueDate": "2025-12-05T12:00:00.000Z",
  "supplier": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "ACME Corp",
    "taxId": "12-3456789"
  },
  "lineItems": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440000",
      "description": "Widget A",
      "quantity": 10,
      "unitPrice": {
        "amount": 50.00,
        "currency": "USD"
      },
      "total": {
        "amount": 500.00,
        "currency": "USD"
      }
    }
  ],
  "total": {
    "amount": 500.00,
    "currency": "USD"
  },
  "currency": "USD"
}
```

**Response (201 Created):**
```json
{
  "id": "750e8400-e29b-41d4-a716-446655440000",
  "invoiceNumber": "INV-123456",
  "status": "pending",
  "createdAt": "2025-11-05T12:00:00.000Z",
  "updatedAt": "2025-11-05T12:00:00.000Z",
  ...
}
```

#### GET /api/v1/invoices/:id
Retrieve an invoice by ID.

**Response (200 OK):**
```json
{
  "id": "750e8400-e29b-41d4-a716-446655440000",
  "invoiceNumber": "INV-123456",
  ...
}
```

**Response (404 Not Found):**
```json
{
  "type": "https://api.xero.com/problems/not-found",
  "title": "Invoice Not Found",
  "status": 404,
  "detail": "Invoice with ID 750e8400-e29b-41d4-a716-446655440000 not found"
}
```

#### GET /api/v1/invoices
List all invoices.

**Response (200 OK):**
```json
{
  "data": [ ... ],
  "total": 42
}
```

### Reconciliations

#### POST /api/v1/reconciliations
Trigger invoice reconciliation.

**Request:**
```json
{
  "invoiceId": "750e8400-e29b-41d4-a716-446655440000",
  "purchaseOrderId": "850e8400-e29b-41d4-a716-446655440000",
  "tolerance": 2.0
}
```

**Response (202 Accepted):**
```json
{
  "id": "950e8400-e29b-41d4-a716-446655440000",
  "invoiceId": "750e8400-e29b-41d4-a716-446655440000",
  "purchaseOrderId": "850e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "confidence": 0,
  "createdAt": "2025-11-05T12:00:00.000Z"
}
```

#### GET /api/v1/reconciliations/:id
Get reconciliation status.

**Response (200 OK):**
```json
{
  "id": "950e8400-e29b-41d4-a716-446655440000",
  "invoiceId": "750e8400-e29b-41d4-a716-446655440000",
  "purchaseOrderId": "850e8400-e29b-41d4-a716-446655440000",
  "status": "matched",
  "confidence": 0.95,
  "matchedAt": "2025-11-05T12:00:05.000Z",
  "createdAt": "2025-11-05T12:00:00.000Z"
}
```

#### GET /api/v1/reconciliations/:id/status
Get reconciliation status (lightweight).

**Response (200 OK):**
```json
{
  "id": "950e8400-e29b-41d4-a716-446655440000",
  "status": "matched",
  "confidence": 0.95
}
```

## Error Responses

All errors follow RFC 7807 Problem Details format.

### Validation Error (400)
```json
{
  "type": "https://api.xero.com/problems/validation-error",
  "title": "Request Validation Failed",
  "status": 400,
  "detail": "One or more fields failed validation",
  "errors": {
    "invoiceNumber": {
      "_errors": ["Invalid format. Expected INV-XXXXXX"]
    }
  }
}
```

### Business Rule Violation (422)
```json
{
  "type": "https://api.xero.com/problems/business-rule-violation",
  "title": "BusinessRuleViolationError",
  "status": 422,
  "detail": "Invoice total must match sum of line items"
}
```

### Internal Server Error (500)
```json
{
  "type": "https://api.xero.com/problems/internal-error",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred"
}
```

## Validation Rules

### Invoice Number
- Format: `INV-XXXXXX` (6 digits)
- Example: `INV-123456`

### Currency Codes
- Allowed: `USD`, `EUR`, `GBP`, `AUD`, `CAD`
- Must be ISO 4217 compliant

### Money Amounts
- Must be positive
- Maximum 4 decimal places
- Precision: 0.0001

### UUIDs
- All IDs must be valid UUID v4 format

### Tolerance
- Range: 0-5%
- Default: 2%
