# Development Guide

## Development Setup

### Prerequisites
- Node.js 20+, PostgreSQL 14+, 4GB RAM, 2 vCPU
- Git 2.30+
- Deepseek API key for AI integration
- Understanding of professional conversational AI tone requirements
- Familiarity with appliance parts terminology

### Project Structure
```
partselect-chat-agent/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # Chat interface and UI components
│   │   ├── pages/              # Route components
│   │   ├── lib/                # Utilities and configurations
│   │   └── hooks/              # Custom React hooks
├── server/                     # Backend Node.js application
│   ├── services/               # Chat, AI, troubleshooting, and part services
│   │   ├── chatService.ts      # Core conversation orchestration
│   │   ├── deepseekClient.ts   # AI integration with professional persona
│   │   ├── partDataService.ts  # Live PartSelect data integration
│   │   ├── livePartSelectScraper.ts # Advanced scraping with anti-bot bypass
│   │   ├── partImageScraper.ts # Image scraping with enhanced SVG fallbacks
│   │   ├── contactService.ts   # Automatic contact detection and redirection
│   │   ├── troubleshootingService.ts # Context-aware diagnostic flows
│   │   └── buyLinkService.ts   # Purchase link generation
│   ├── routes/                 # API route handlers
│   ├── middleware/             # Express middleware
│   └── db.ts                   # Database configuration
├── shared/                     # Shared types and schemas
│   └── schema.ts               # Database schema and types
├── docs/                       # Technical documentation
└── package.json                # Project dependencies
```

## Code Quality Standards

### TypeScript Configuration

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["client/src", "server", "shared"],
  "exclude": ["node_modules", "dist"]
}
```

### ESLint Configuration

**.eslintrc.js:**
```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
    'no-var': 'error'
  }
};
```

### Prettier Configuration

**.prettierrc:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## Development Workflow

### Git Workflow

#### Conventions
```
# Branch naming
feature/description
bugfix/description
hotfix/description

# Commit format
type(scope): description

# Types: feat, fix, docs, style, refactor, perf, test, chore
```

### Development Commands

#### Commands
```bash
# Setup
npm install
npm run db:push
npm run dev

# Development
npm run type-check
npm run lint
npm run format

# Testing
npm test
npm run test:watch
npm run test:coverage

# Build
npm run build
npm run preview
```

## Testing Strategy

### Testing Pyramid

#### Unit Tests (70%)
- **Framework**: Jest + React Testing Library
- **Location**: `__tests__/` directories
- **Coverage**: Individual functions and components

```typescript
// Example unit test
import { render, screen } from '@testing-library/react';
import { ChatMessage } from '../ChatMessage';

describe('ChatMessage', () => {
  it('renders user message correctly', () => {
    render(
      <ChatMessage 
        role="user" 
        content="Hello" 
        timestamp={new Date()} 
      />
    );
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByRole('article')).toHaveClass('user-message');
  });
});
```

#### Integration Tests (20%)
- **Framework**: Jest + Supertest
- **Location**: `server/__tests__/`
- **Coverage**: API endpoints and service interactions

```typescript
// Example integration test
import request from 'supertest';
import { app } from '../app';

describe('POST /api/chat', () => {
  it('should return AI response for valid message', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({ message: 'Test message' })
      .expect(200);

    expect(response.body).toHaveProperty('text');
    expect(response.body).toHaveProperty('conversationId');
  });
});
```

#### E2E Tests (10%)
- **Framework**: Playwright
- **Location**: `e2e/` directory
- **Coverage**: Critical user journeys

```typescript
// Example E2E test
import { test, expect } from '@playwright/test';

test('user can send message and receive response', async ({ page }) => {
  await page.goto('/');
  
  await page.fill('[data-testid="message-input"]', 'I need help with my refrigerator');
  await page.click('[data-testid="send-button"]');
  
  await expect(page.locator('[data-testid="ai-response"]')).toBeVisible();
  await expect(page.locator('[data-testid="product-card"]')).toBeVisible();
});
```

### Test Configuration

**jest.config.js:**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1'
  },
  collectCoverageFrom: [
    'client/src/**/*.{ts,tsx}',
    'server/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## Code Standards

### React Component Guidelines

#### Component Structure
```typescript
// Good: Functional component with TypeScript
interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  productCards?: ProductCard[];
}

export function ChatMessage({ role, content, timestamp, productCards }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <article className={`message ${role}-message`} data-testid="chat-message">
      <div className="message-content">{content}</div>
      <time className="message-timestamp">{formatTime(timestamp)}</time>
      {productCards && (
        <div className="product-cards">
          {productCards.map(card => (
            <ProductCard key={card.partNumber} {...card} />
          ))}
        </div>
      )}
    </article>
  );
}
```

#### Hook Guidelines
```typescript
// Custom hook example
export function useChat(conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('/api/chat', {
        method: 'POST',
        body: { message: content, conversationId }
      });
      
      setMessages(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  return { messages, isLoading, sendMessage };
}
```

### Backend Service Guidelines

#### Service Pattern
```typescript
// Good: Service class with dependency injection
export class ChatService {
  constructor(
    private deepseekClient: DeepseekClient,
    private partKnowledgeService: PartKnowledgeService,
    private storage: DatabaseStorage
  ) {}

  async processMessage(
    message: string,
    conversationId?: string
  ): Promise<ChatResponse> {
    // Validate input
    const validation = chatRequestSchema.safeParse({ message, conversationId });
    if (!validation.success) {
      throw new ValidationError(validation.error);
    }

    // Process message
    const conversation = await this.getOrCreateConversation(conversationId);
    const aiResponse = await this.deepseekClient.generateResponse(message);
    const productCards = await this.extractProductCards(aiResponse);

    // Save to database
    await this.storage.saveMessage({
      conversationId: conversation.id,
      role: 'user',
      content: message
    });

    await this.storage.saveMessage({
      conversationId: conversation.id,
      role: 'assistant',
      content: aiResponse.text,
      productCards
    });

    return {
      text: aiResponse.text,
      conversationId: conversation.id,
      productCards
    };
  }
}
```

#### Error Handling
```typescript
// Good: Structured error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Error middleware
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Unexpected error
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }
  });
}
```

## Database Development

### Schema Management

#### Schema Definition
```typescript
// shared/schema.ts
import { pgTable, serial, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email'),
  createdAt: timestamp('created_at').defaultNow(),
  lastActiveAt: timestamp('last_active_at').defaultNow()
});

export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: serial('user_id').references(() => users.id),
  title: text('title').notNull(),
  status: text('status', { enum: ['active', 'closed', 'escalated'] }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  metadata: jsonb('metadata')
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  conversations: many(conversations)
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id]
  }),
  messages: many(messages)
}));
```

#### Migration Strategy
```bash
# Generate migration
npm run db:generate

# Review generated migration
cat drizzle/migrations/0001_migration.sql

# Apply migration
npm run db:migrate

# Rollback if needed
npm run db:rollback
```

### Query Optimization

#### Efficient Queries
```typescript
// Good: Use indexes and limit results
export async function getConversationMessages(conversationId: string, limit = 50) {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

// Good: Use joins for related data
export async function getConversationsWithLastMessage(userId: number) {
  return await db
    .select({
      conversation: conversations,
      lastMessage: {
        content: messages.content,
        createdAt: messages.createdAt
      }
    })
    .from(conversations)
    .leftJoin(messages, eq(conversations.id, messages.conversationId))
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt));
}
```

## Performance Guidelines

### Frontend Performance

#### Bundle Optimization
```typescript
// Good: Lazy loading
const ChatPage = lazy(() => import('./pages/ChatPage'));
const ConversationHistory = lazy(() => import('./pages/ConversationHistory'));

// Good: Code splitting by route
function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/history" element={<ConversationHistory />} />
      </Routes>
    </Suspense>
  );
}
```

#### State Management
```typescript
// Good: Optimized React Query usage
export function useChatMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => fetchMessages(conversationId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!conversationId
  });
}

// Good: Mutation with optimistic updates
export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sendMessage,
    onMutate: async (newMessage) => {
      // Optimistic update
      const previousMessages = queryClient.getQueryData(['messages', newMessage.conversationId]);
      
      queryClient.setQueryData(['messages', newMessage.conversationId], (old: Message[]) => [
        ...old,
        { ...newMessage, id: 'temp-' + Date.now(), createdAt: new Date() }
      ]);
      
      return { previousMessages };
    },
    onError: (err, newMessage, context) => {
      // Rollback on error
      queryClient.setQueryData(['messages', newMessage.conversationId], context?.previousMessages);
    },
    onSettled: (data, error, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries(['messages', variables.conversationId]);
    }
  });
}
```

### Backend Performance

#### Caching Strategy
```typescript
// Good: Multi-layer caching
export class CacheService {
  private memoryCache = new Map<string, { data: any; expiry: number }>();
  
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const cached = this.memoryCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    
    // Check Redis if available
    if (this.redis) {
      const redisValue = await this.redis.get(key);
      if (redisValue) {
        const data = JSON.parse(redisValue);
        this.memoryCache.set(key, { data, expiry: Date.now() + 5 * 60 * 1000 });
        return data;
      }
    }
    
    return null;
  }
  
  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    const expiry = Date.now() + ttl;
    
    // Set in memory cache
    this.memoryCache.set(key, { data: value, expiry });
    
    // Set in Redis if available
    if (this.redis) {
      await this.redis.setex(key, Math.floor(ttl / 1000), JSON.stringify(value));
    }
  }
}
```

## Debugging Guidelines

### Development Debugging

#### Console Logging
```typescript
// Good: Structured logging
const logger = {
  info: (message: string, meta?: any) => console.log(`[INFO] ${message}`, meta || ''),
  error: (message: string, error?: Error) => console.error(`[ERROR] ${message}`, error),
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }
};

// Usage
logger.info('Processing chat message', { conversationId, messageLength: message.length });
logger.error('Failed to generate AI response', error);
```

#### Error Boundaries
```typescript
// Good: Error boundary component
export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught error:', error, errorInfo);
    
    // Send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.stack}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Production Debugging

#### Health Checks
```typescript
// Good: Comprehensive health check
export async function healthCheck(): Promise<HealthStatus> {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkAIService(),
    checkScrapingService(),
    checkCache()
  ]);

  const status: HealthStatus = {
    status: 'healthy',
    services: {},
    metrics: {
      responseTime: Date.now() - startTime,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    },
    timestamp: new Date().toISOString()
  };

  // Process check results
  checks.forEach((result, index) => {
    const serviceName = ['database', 'ai', 'scraper', 'cache'][index];
    status.services[serviceName] = result.status === 'fulfilled' ? 'up' : 'down';
    
    if (result.status === 'rejected') {
      status.status = 'degraded';
    }
  });

  return status;
}
```

## Documentation Standards

### Code Documentation
```typescript
/**
 * Processes a user message and generates an AI response with product recommendations
 * 
 * @param message - The user's input message
 * @param conversationId - Optional existing conversation ID
 * @param options - Additional processing options
 * @returns Promise resolving to chat response with AI text and product cards
 * 
 * @throws {ValidationError} When message validation fails
 * @throws {AIServiceError} When AI service is unavailable
 * 
 * @example
 * ```typescript
 * const response = await chatService.processMessage(
 *   "I need an ice maker for my WRS325SDHZ",
 *   "conversation-123"
 * );
 * ```
 */
export async function processMessage(
  message: string,
  conversationId?: string,
  options: ProcessingOptions = {}
): Promise<ChatResponse> {
  // Implementation
}
```

### API Documentation
Use JSDoc comments that auto-generate OpenAPI specifications:

```typescript
/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Send a chat message
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 description: User input message
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 */
```

