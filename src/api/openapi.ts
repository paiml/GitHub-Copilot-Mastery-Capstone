import { Hono } from "hono";

export function setupOpenAPI(app: Hono): void {
  // OpenAPI specification
  app.get("/api/docs", (c) => {
    const spec = {
      openapi: "3.0.0",
      info: {
        title: "Invoice Reconciliation API",
        version: "1.0.0",
        description:
          "Enterprise-grade invoice reconciliation system with fuzzy matching, multi-currency support, and type-safe error handling.",
        contact: {
          name: "API Support",
          email: "support@pretendco.com",
        },
      },
      servers: [
        {
          url: "http://localhost:9001",
          description: "Development server",
        },
      ],
      tags: [
        {
          name: "Health",
          description: "Service health and status endpoints",
        },
        {
          name: "Invoices",
          description: "Invoice CRUD operations",
        },
        {
          name: "Reconciliation",
          description: "Invoice-to-PO reconciliation operations",
        },
      ],
      paths: {
        "/health": {
          get: {
            tags: ["Health"],
            summary: "Health check",
            description: "Get service health status and version information",
            responses: {
              "200": {
                description: "Service is healthy",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        status: { type: "string", example: "healthy" },
                        timestamp: { type: "string", format: "date-time" },
                        version: { type: "string", example: "1.0.0" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        "/api/v1/invoices": {
          get: {
            tags: ["Invoices"],
            summary: "List all invoices",
            description: "Retrieve a list of all invoices in the system",
            responses: {
              "200": {
                description: "List of invoices",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Invoice" },
                    },
                  },
                },
              },
            },
          },
          post: {
            tags: ["Invoices"],
            summary: "Create a new invoice",
            description: "Create a new invoice with validation",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/InvoiceInput" },
                },
              },
            },
            responses: {
              "201": {
                description: "Invoice created successfully",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Invoice" },
                  },
                },
              },
              "400": {
                description: "Validation error",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ProblemDetails" },
                  },
                },
              },
            },
          },
        },
        "/api/v1/invoices/{id}": {
          get: {
            tags: ["Invoices"],
            summary: "Get invoice by ID",
            description: "Retrieve a specific invoice by its UUID",
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "string", format: "uuid" },
                description: "Invoice UUID",
              },
            ],
            responses: {
              "200": {
                description: "Invoice found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Invoice" },
                  },
                },
              },
              "404": {
                description: "Invoice not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ProblemDetails" },
                  },
                },
              },
            },
          },
        },
        "/api/v1/reconciliations": {
          post: {
            tags: ["Reconciliation"],
            summary: "Reconcile invoice to purchase order",
            description: "Match an invoice to a purchase order using fuzzy matching algorithms",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ReconciliationRequest" },
                },
              },
            },
            responses: {
              "200": {
                description: "Reconciliation completed",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ReconciliationResult" },
                  },
                },
              },
              "404": {
                description: "Invoice not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ProblemDetails" },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Invoice: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              invoiceNumber: {
                type: "string",
                pattern: "^INV-\\d{6}$",
                example: "INV-202401",
              },
              date: { type: "string", format: "date-time" },
              dueDate: { type: "string", format: "date-time" },
              supplier: { $ref: "#/components/schemas/Supplier" },
              lineItems: {
                type: "array",
                items: { $ref: "#/components/schemas/LineItem" },
              },
              total: { $ref: "#/components/schemas/Money" },
              currency: { $ref: "#/components/schemas/CurrencyCode" },
              status: { type: "string", example: "pending" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          InvoiceInput: {
            type: "object",
            required: [
              "invoiceNumber",
              "date",
              "dueDate",
              "supplier",
              "lineItems",
              "total",
              "currency",
            ],
            properties: {
              invoiceNumber: {
                type: "string",
                pattern: "^INV-\\d{6}$",
                example: "INV-202401",
              },
              date: { type: "string", format: "date-time" },
              dueDate: { type: "string", format: "date-time" },
              supplier: { $ref: "#/components/schemas/Supplier" },
              lineItems: {
                type: "array",
                items: { $ref: "#/components/schemas/LineItem" },
                minItems: 1,
              },
              total: { $ref: "#/components/schemas/Money" },
              currency: { $ref: "#/components/schemas/CurrencyCode" },
            },
          },
          Supplier: {
            type: "object",
            required: ["id", "name"],
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string", maxLength: 255 },
              taxId: { type: "string" },
            },
          },
          LineItem: {
            type: "object",
            required: ["id", "description", "quantity", "unitPrice", "total"],
            properties: {
              id: { type: "string", format: "uuid" },
              description: { type: "string", minLength: 1, maxLength: 500 },
              quantity: { type: "integer", minimum: 1 },
              unitPrice: { $ref: "#/components/schemas/Money" },
              total: { $ref: "#/components/schemas/Money" },
            },
          },
          Money: {
            type: "object",
            required: ["amount", "currency"],
            properties: {
              amount: {
                type: "number",
                format: "double",
                minimum: 0,
                example: 1250.0,
              },
              currency: { $ref: "#/components/schemas/CurrencyCode" },
            },
          },
          CurrencyCode: {
            type: "string",
            enum: ["USD", "EUR", "GBP", "AUD", "CAD"],
          },
          ReconciliationRequest: {
            type: "object",
            required: ["invoiceId", "purchaseOrder"],
            properties: {
              invoiceId: { type: "string", format: "uuid" },
              purchaseOrder: { $ref: "#/components/schemas/PurchaseOrder" },
            },
          },
          PurchaseOrder: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              poNumber: { type: "string" },
              date: { type: "string", format: "date-time" },
              vendor: { $ref: "#/components/schemas/Supplier" },
              lineItems: {
                type: "array",
                items: { $ref: "#/components/schemas/LineItem" },
              },
              total: { $ref: "#/components/schemas/Money" },
              currency: { $ref: "#/components/schemas/CurrencyCode" },
            },
          },
          ReconciliationResult: {
            type: "object",
            properties: {
              reconciliationId: { type: "string", format: "uuid" },
              status: { type: "string", enum: ["completed", "failed"] },
              confidence: { type: "number", minimum: 0, maximum: 100 },
              bestMatch: { type: "object" },
              alternatives: { type: "array", items: { type: "object" } },
            },
          },
          ProblemDetails: {
            type: "object",
            description: "RFC 7807 Problem Details for HTTP APIs",
            properties: {
              type: {
                type: "string",
                format: "uri",
                example: "about:blank",
              },
              title: { type: "string", example: "Request Validation Failed" },
              status: { type: "integer", example: 400 },
              detail: { type: "string" },
              instance: { type: "string", format: "uri" },
              errors: { type: "object" },
            },
          },
        },
      },
    };

    return c.json(spec);
  });

  // Swagger UI HTML page
  app.get("/api/swagger", (c) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice Reconciliation API - Swagger UI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui.css">
    <style>
        body { margin: 0; padding: 0; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            SwaggerUIBundle({
                url: "/api/docs",
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>
    `;

    return c.html(html);
  });
}
