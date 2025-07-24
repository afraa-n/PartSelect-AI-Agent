# API Reference

## Base URL

Development: `http://localhost:5000/api`  
Production: `https://your-domain.com/api`

Express session management with PostgreSQL storage for conversation persistence.

## Core Endpoints

### Chat Management

#### Send Message
Creates a new message in a conversation and returns AI response.

```http
POST /api/chat
Content-Type: application/json
```

**Request Body:**
```typescript
{
  message: string;                    // User input message (1-1000 chars)
  conversationId?: string;            // Optional conversation UUID
  metadata?: {                        // Optional request metadata
    userAgent?: string;               // Client user agent
    voiceInput?: boolean;             // Was this voice input?
    sessionId?: string;               // Session identifier
  };
}
```

**Response:**
```typescript
{
  text: string;                       // AI response text
  conversationId: string;             // Conversation UUID
  productCards?: ProductCard[];       // Product recommendations
  metadata?: {                        // Response metadata
    processingTime: number;           // Response time in ms
    confidenceScore: number;          // AI confidence (0-1)
    sourcesUsed: string[];            // Data sources used
  };
}
```

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need a ice maker for my WRS325SDHZ refrigerator",
    "conversationId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

**Example Response:**
```json
{
  "text": "For your WRS325SDHZ fridge, you'll want part number PS12584610 - that's the exact ice maker assembly that fits your model. It's $100.79 and includes comprehensive installation instructions with safety protocols. Pretty common fix - unplug the fridge before installing and it should take about 45-60 minutes with Phillips head screwdriver.",
  "conversationId": "123e4567-e89b-12d3-a456-426614174000",
  "productCards": [
    {
      "partNumber": "PS12584610",
      "name": "Ice Maker Assembly",
      "price": "$100.79",
      "imageUrl": "/api/proxy-image?url=...",
      "compatibility": ["WRS325SDHZ01", "WRS325SDHZ05"],
      "buyLink": "https://www.partselect.com/PS12584610-Ice-Maker-Assembly.htm"
    }
  ],
  "metadata": {
    "processingTime": 487,
    "confidenceScore": 0.95,
    "sourcesUsed": ["partselect", "part_knowledge"]
  }
}
```

### Conversation Management

#### List Conversations
Retrieves all conversations for the current user.

```http
GET /api/conversations
```

**Response:**
```typescript
Conversation[]

interface Conversation {
  id: string;                         // Conversation UUID
  userId?: number;                    // User ID (if authenticated)
  title: string;                      // Conversation title
  status: 'active' | 'closed' | 'escalated';
  createdAt: string;                  // ISO timestamp
  updatedAt: string;                  // ISO timestamp
  metadata?: Record<string, any>;     // Additional data
}
```

#### Create Conversation
Creates a new conversation.

```http
POST /api/conversations
Content-Type: application/json
```

**Request Body:**
```typescript
{
  title: string;                      // Conversation title
  initialMessage?: string;            // Optional first message
}
```

#### Get Conversation Messages
Retrieves all messages for a specific conversation.

```http
GET /api/conversations/:id/messages
```

**Response:**
```typescript
Message[]

interface Message {
  id: string;                         // Message UUID
  conversationId: string;             // Parent conversation UUID
  role: 'user' | 'assistant' | 'system';
  content: string;                    // Message content
  productCards?: ProductCard[];       // Attached product cards
  metadata?: {                        // Message metadata
    processingTime?: number;
    aiModel?: string;
    confidenceScore?: number;
  };
  createdAt: string;                  // ISO timestamp
}
```

#### Delete Conversation
Permanently deletes a conversation and all its messages.

```http
DELETE /api/conversations/:id
```

**Response:**
```typescript
{
  success: boolean;
  deletedAt: string;                  // ISO timestamp
}
```

### Part Information Services

#### Search Parts
Searches for parts based on query and appliance type.

```http
GET /api/parts/search?q={query}&appliance={type}
```

**Query Parameters:**
- `q` (required): Search query string
- `appliance` (optional): `refrigerator` or `dishwasher`
- `limit` (optional): Maximum results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```typescript
{
  parts: ProductCard[];               // Matching parts
  totalResults: number;               // Total count
  suggestions: string[];              // Search suggestions
  facets?: {                          // Search facets
    categories: string[];
    priceRanges: string[];
    brands: string[];
  };
}
```

#### Get Part Details
Retrieves detailed information for a specific part number.

```http
GET /api/parts/:partNumber
```

**Response:**
```typescript
{
  part: ProductCard;                  // Part information
  compatibleModels: string[];         // Compatible appliance models
  installationGuide?: {               // Installation instructions
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: string;
    toolsRequired: string[];
    steps: string[];
  };
  troubleshooting?: {                 // Troubleshooting info
    commonIssues: string[];
    diagnosticSteps: string[];
  };
  relatedParts?: ProductCard[];       // Related/alternative parts
}
```

#### Check Compatibility
Checks part compatibility for a specific appliance model.

```http
GET /api/compatibility/:modelNumber
```

**Response:**
```typescript
{
  model: string;                      // Appliance model number
  appliance: 'refrigerator' | 'dishwasher';
  compatibleParts: ProductCard[];     // Compatible parts
  commonIssues: {                     // Common model issues
    issue: string;
    frequency: number;                // Issue frequency (0-1)
    recommendedParts: string[];       // Part numbers for fixes
  }[];
  specifications?: {                  // Model specifications
    brand: string;
    year?: number;
    capacity?: string;
    features: string[];
  };
}
```

### Utility Services

#### Image Proxy
Proxies external images with caching and optimization.

```http
GET /api/proxy-image?url={encodedImageUrl}&size={optional}
```

**Query Parameters:**
- `url` (required): URL-encoded image URL
- `size` (optional): `small`, `medium`, `large` (default: original)

**Response:**
- Binary image data with appropriate Content-Type header
- Cache-Control headers for browser caching

#### Health Check
Returns system health status.

```http
GET /api/health
```

**Response:**
```typescript
{
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: 'up' | 'down';
    ai: 'up' | 'down';
    scraper: 'up' | 'down';
    cache: 'up' | 'down';
  };
  metrics: {
    responseTime: number;             // Average response time (ms)
    errorRate: number;                // Error rate (0-1)
    uptime: number;                   // Uptime in seconds
  };
  timestamp: string;                  // ISO timestamp
}
```

## Data Types

### ProductCard
```typescript
interface ProductCard {
  partNumber: string;                 // Part number (e.g., "PS12584610")
  name: string;                       // Product name
  price: string;                      // Formatted price (e.g., "$312.99")
  imageUrl: string;                   // Product image URL
  compatibility: string[];            // Compatible model numbers
  buyLink: string;                    // Direct purchase URL
  inStock?: boolean;                  // Availability status
  rating?: number;                    // Customer rating (1-5)
  brand?: string;                     // Manufacturer brand
  category?: string;                  // Part category
}
```

## Error Handling

### Standard Error Response
```typescript
{
  error: {
    code: string;                     // Machine-readable error code
    message: string;                  // Human-readable error message
    details?: any;                    // Additional error context
    timestamp: string;                // ISO timestamp
    requestId?: string;               // Request tracking ID
    path?: string;                    // API endpoint path
  };
}
```

### Error Codes

#### Client Errors (4xx)
- `INVALID_REQUEST`: Malformed request data
- `INVALID_MESSAGE`: Message validation failed
- `CONVERSATION_NOT_FOUND`: Conversation ID not found
- `RATE_LIMITED`: Too many requests
- `VALIDATION_ERROR`: Schema validation failed

#### Server Errors (5xx)
- `AI_SERVICE_ERROR`: Deepseek API failure
- `DATABASE_ERROR`: Database connection/query failure
- `SCRAPER_ERROR`: Web scraping service failure
- `INTERNAL_ERROR`: Unexpected server error
- `SERVICE_UNAVAILABLE`: External service dependency failure

### HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `502 Bad Gateway`: External service error
- `503 Service Unavailable`: Service temporarily unavailable

## Rate Limiting

### Limits
- **Chat API**: 30 requests per minute per IP
- **Search API**: 60 requests per minute per IP
- **Image Proxy**: 100 requests per minute per IP
- **Health Check**: No limit

### Headers
```http
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 1640995200
```

## Webhooks (Future Feature)

### Conversation Events
```typescript
interface ConversationWebhook {
  event: 'conversation.created' | 'conversation.updated' | 'conversation.escalated';
  data: Conversation;
  timestamp: string;
}
```

### Part Availability Events
```typescript
interface PartAvailabilityWebhook {
  event: 'part.back_in_stock' | 'part.price_changed';
  data: {
    partNumber: string;
    oldPrice?: string;
    newPrice?: string;
    inStock: boolean;
  };
  timestamp: string;
}
```

