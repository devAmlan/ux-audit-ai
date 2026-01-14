# Audit Service API Documentation

This document describes the REST API endpoints for the Audit Service, which manages website audit records and their processing status.

---

## Base URL

```
http://localhost:3060/api
```

---

## Authentication

**Note:** Authentication is currently disabled. All requests use `userId = "anonymous"` as a placeholder.

---

## Data Models

### Audit Object

```typescript
{
  id: string; // UUID, auto-generated
  userId: string; // Currently "anonymous"
  url: string; // The website URL to audit
  status: AuditStatus; // PENDING | PROCESSING | COMPLETED | FAILED
  createdAt: Date; // ISO 8601 timestamp
  updatedAt: Date; // ISO 8601 timestamp
}
```

### AuditStatus Enum

- `PENDING` - Audit has been created but not yet started
- `PROCESSING` - Audit is currently being processed
- `COMPLETED` - Audit has been successfully completed
- `FAILED` - Audit processing failed

---

## Endpoints

### 1. Create Audit

Creates a new audit record for a given URL.

**Endpoint:** `POST /api/audits`

**Request Body:**

```json
{
  "url": "https://example.com"
}
```

**Request Headers:**

```
Content-Type: application/json
```

**Request Body Schema:**

- `url` (string, required): Valid HTTP/HTTPS URL

**Response:**

**Success (201 Created):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "anonymous",
  "url": "https://example.com",
  "status": "PENDING",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error (400 Bad Request):**

```json
{
  "error": "URL is required and must be a non-empty string"
}
```

```json
{
  "error": "Invalid URL format"
}
```

**Validation Rules:**

- URL must be a non-empty string
- URL must be a valid URL format (validated using JavaScript `URL` constructor)
- URL is automatically trimmed of whitespace

**Example Request:**

```bash
curl -X POST http://localhost:3060/api/audits \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Example Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "anonymous",
  "url": "https://example.com",
  "status": "PENDING",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### 2. Get All Audits

Retrieves a list of all audit records, ordered by creation date (newest first).

**Endpoint:** `GET /api/audits`

**Request Headers:**

```
(No special headers required)
```

**Query Parameters:**
None

**Response:**

**Success (200 OK):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "anonymous",
    "url": "https://example.com",
    "status": "COMPLETED",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "userId": "anonymous",
    "url": "https://another-example.com",
    "status": "PENDING",
    "createdAt": "2024-01-15T09:20:00.000Z",
    "updatedAt": "2024-01-15T09:20:00.000Z"
  }
]
```

**Empty List (200 OK):**

```json
[]
```

**Error (500 Internal Server Error):**

```json
{
  "error": "Failed to fetch audits"
}
```

**Sorting:**

- Results are sorted by `createdAt` in descending order (newest first)

**Example Request:**

```bash
curl http://localhost:3060/api/audits
```

**Example Response:**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "anonymous",
    "url": "https://example.com",
    "status": "PENDING",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### 3. Get Audit by ID

Retrieves a single audit record by its unique identifier.

**Endpoint:** `GET /api/audits/:id`

**Path Parameters:**

- `id` (string, required): UUID of the audit record

**Request Headers:**

```
(No special headers required)
```

**Response:**

**Success (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "anonymous",
  "url": "https://example.com",
  "status": "PROCESSING",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:32:00.000Z"
}
```

**Error (400 Bad Request):**

```json
{
  "error": "Audit ID is required"
}
```

**Error (404 Not Found):**

```json
{
  "error": "Audit not found"
}
```

**Error (500 Internal Server Error):**

```json
{
  "error": "Failed to fetch audit"
}
```

**Example Request:**

```bash
curl http://localhost:3060/api/audits/550e8400-e29b-41d4-a716-446655440000
```

**Example Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "anonymous",
  "url": "https://example.com",
  "status": "PENDING",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## Health Check

**Endpoint:** `GET /api/health`

**Response:**

```
API is running
```

**Example Request:**

```bash
curl http://localhost:3060/api/health
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data or missing required fields
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error occurred

---

## Architecture

The API follows a clean architecture pattern:

```
Routes → Controller → Service → Database (Prisma)
```

### Request Flow

1. **Routes** (`audit.routes.ts`) - Define HTTP endpoints and map to controllers
2. **Controller** (`audit.controller.ts`) - Handle HTTP concerns (request/response, status codes)
3. **Service** (`audit.service.ts`) - Contains business logic and validation
4. **Database** (`lib/prisma.ts`) - Prisma client for database operations

### Key Files

- `apps/api/src/modules/audit/audit.routes.ts` - Route definitions
- `apps/api/src/modules/audit/audit.controller.ts` - HTTP handlers
- `apps/api/src/modules/audit/audit.service.ts` - Business logic
- `apps/api/src/modules/audit/audit.types.ts` - TypeScript type definitions
- `apps/api/src/routes.ts` - Main route registration
- `apps/api/src/index.ts` - Express server setup

---

## Usage Examples

### Create an Audit

```bash
curl -X POST http://localhost:3060/api/audits \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Get All Audits

```bash
curl http://localhost:3060/api/audits
```

### Get Specific Audit

```bash
curl http://localhost:3060/api/audits/550e8400-e29b-41d4-a716-446655440000
```

### JavaScript/TypeScript Example

```typescript
// Create audit
const response = await fetch("http://localhost:3060/api/audits", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: "https://example.com",
  }),
});

const audit = await response.json();
console.log("Created audit:", audit);

// Get all audits
const auditsResponse = await fetch("http://localhost:3060/api/audits");
const audits = await auditsResponse.json();
console.log("All audits:", audits);

// Get specific audit
const auditResponse = await fetch(
  `http://localhost:3060/api/audits/${audit.id}`
);
const singleAudit = await auditResponse.json();
console.log("Single audit:", singleAudit);
```

---

## Notes

1. **Authentication**: Currently disabled. All requests use `userId = "anonymous"`.

2. **URL Validation**: The API performs basic URL validation:

   - Checks for non-empty string
   - Validates URL format using JavaScript `URL` constructor
   - Trims whitespace automatically

3. **Status Flow**: Audit status transitions:

   - `PENDING` → `PROCESSING` → `COMPLETED` or `FAILED`
   - Status updates are handled by the worker service (not yet implemented)

4. **Database**: Uses PostgreSQL with Prisma ORM. All timestamps are in UTC.

5. **CORS**: API is configured to accept requests from `http://localhost:5174` (client dev server).

---

## Future Enhancements

- [ ] Add authentication and user-specific audits
- [ ] Add pagination for `GET /api/audits`
- [ ] Add filtering by status
- [ ] Add search by URL
- [ ] Add update endpoint for audit status
- [ ] Add delete endpoint
- [ ] Add audit result data to response
