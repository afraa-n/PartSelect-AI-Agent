# Deployment Guide

## Prerequisites

### System Requirements

#### Development
- Node.js 20.0+
- PostgreSQL 14+
- 1GB RAM minimum

#### Production
- Node.js 20+, PostgreSQL 14+, 4GB RAM, 2 vCPU
- PostgreSQL with connection pooling
- 2GB+ storage

### Environment Variables
```bash
# Required
DATABASE_URL=postgresql://user:password@host:port/database
DEEPSEEK_API_KEY=your_deepseek_api_key
NODE_ENV=production|development
SESSION_SECRET=your_secure_session_secret

# PartSelect Integration
PARTSELECT_SCRAPING_ENABLED=true
CONTACT_PHONE_NUMBER=1-866-319-8402

# Optional
LOG_LEVEL=info|debug|warn|error
REDIS_URL=redis://localhost:6379
```

## Local Development Setup

### 1. Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd partselect-chat-agent

# Install dependencies
npm install

# Verify Node.js version
node --version  # Should be 20.0+
```

### 2. Database Setup
```bash
# Create database schema
npm run db:push

# Verify database connectivity
npm run db:check

# Optional: Seed initial data
npm run db:seed
```

### 3. Environment Configuration
```bash
# Create environment file
cp .env.example .env

# Edit environment variables
nano .env
```

### 4. Development Server
```bash
# Start development environment
npm run dev

# Application available at http://localhost:5000
```

### 5. Verify Installation
```bash
# Run health check
curl http://localhost:5000/api/health

# Test chat endpoint
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

## Production Deployment

### Docker Deployment

#### Dockerfile
```dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

#### Build and Run
```bash
# Build Docker image
docker build -t partselect-chat-agent .

# Run container
docker run -d \
  --name partselect-chat \
  -p 5000:5000 \
  --env-file .env \
  partselect-chat-agent
```

### Docker Compose

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - SESSION_SECRET=${SESSION_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: ${PGDATABASE}
      POSTGRES_USER: ${PGUSER}
      POSTGRES_PASSWORD: ${PGPASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

#### Start Services
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Scale application
docker-compose up -d --scale app=3
```

### Cloud Deployment

#### AWS ECS Deployment

**Task Definition (task-definition.json):**
```json
{
  "family": "partselect-chat-agent",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "partselect-chat-agent",
      "image": "your-account.dkr.ecr.region.amazonaws.com/partselect-chat-agent:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:database-url"
        },
        {
          "name": "DEEPSEEK_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:deepseek-api-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/partselect-chat-agent",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:5000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

**Deployment Commands:**
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker build -t partselect-chat-agent .
docker tag partselect-chat-agent:latest your-account.dkr.ecr.us-east-1.amazonaws.com/partselect-chat-agent:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/partselect-chat-agent:latest

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Update service
aws ecs update-service --cluster your-cluster --service partselect-chat-agent --task-definition partselect-chat-agent:1
```

#### Kubernetes Deployment

**deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: partselect-chat-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: partselect-chat-agent
  template:
    metadata:
      labels:
        app: partselect-chat-agent
    spec:
      containers:
      - name: app
        image: partselect-chat-agent:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        - name: DEEPSEEK_API_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: deepseek-api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 10
          periodSeconds: 10

---
apiVersion: v1
kind: Service
metadata:
  name: partselect-chat-agent-service
spec:
  selector:
    app: partselect-chat-agent
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5000
  type: LoadBalancer
```

**Deploy to Kubernetes:**
```bash
# Apply deployment
kubectl apply -f deployment.yaml

# Check status
kubectl get pods
kubectl get services

# Scale deployment
kubectl scale deployment partselect-chat-agent --replicas=5
```

## Database Migration

### Schema Updates
```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate

# Rollback migration (if needed)
npm run db:rollback
```

### Backup and Restore
```bash
# Create backup
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql

# Automated backup script
#!/bin/bash
BACKUP_PATH="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > $BACKUP_PATH/backup_$TIMESTAMP.sql
```

## Load Balancing & Scaling

### Nginx Configuration
```nginx
upstream partselect_backend {
    server app1:5000;
    server app2:5000;
    server app3:5000;
}

server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://partselect_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location / {
        proxy_pass http://partselect_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Auto-scaling Configuration

**AWS Auto Scaling Group:**
```json
{
  "AutoScalingGroupName": "partselect-chat-asg",
  "MinSize": 2,
  "MaxSize": 10,
  "DesiredCapacity": 3,
  "TargetGroupARNs": ["arn:aws:elasticloadbalancing:region:account:targetgroup/partselect-chat-tg"],
  "HealthCheckType": "ELB",
  "HealthCheckGracePeriod": 300,
  "Tags": [
    {
      "Key": "Name",
      "Value": "partselect-chat-instance",
      "PropagateAtLaunch": true
    }
  ]
}
```

## SSL/TLS Configuration

### Let's Encrypt with Certbot
```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Custom SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/your-domain.crt;
    ssl_certificate_key /etc/nginx/ssl/your-domain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## Monitoring Setup

### Application Monitoring
```javascript
// Add to your application
const monitoring = require('./monitoring');

app.use(monitoring.middleware);

// Health check endpoint with detailed metrics
app.get('/api/health', async (req, res) => {
  const health = await monitoring.getHealthStatus();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});
```

### Log Management
```bash
# Structured logging with winston
npm install winston winston-daily-rotate-file

# Log aggregation with ELK stack
docker run -d --name elasticsearch elasticsearch:7.14.0
docker run -d --name logstash logstash:7.14.0
docker run -d --name kibana kibana:7.14.0
```

## Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database schema up to date
- [ ] Dependencies installed and updated
- [ ] Security headers configured
- [ ] SSL certificates valid
- [ ] Monitoring and logging setup
- [ ] Backup strategy in place

### Deployment
- [ ] Application builds successfully
- [ ] Health checks pass
- [ ] Database connections working
- [ ] External service integrations functional
- [ ] Load balancer configuration correct

### Post-deployment
- [ ] Application accessible via domain
- [ ] All API endpoints responding
- [ ] Database queries performing well
- [ ] Monitoring alerts configured
- [ ] Log aggregation working
- [ ] Backup systems operational

## Rollback Procedures

### Quick Rollback
```bash
# Docker rollback
docker service update --rollback partselect-chat-agent

# Kubernetes rollback
kubectl rollout undo deployment/partselect-chat-agent

# Database rollback
npm run db:rollback
```

### Blue-Green Deployment
```bash
# Switch traffic to green environment
kubectl patch service partselect-chat-agent-service -p '{"spec":{"selector":{"version":"green"}}}'

# Verify green environment
curl -f http://your-domain.com/api/health

# If issues, switch back to blue
kubectl patch service partselect-chat-agent-service -p '{"spec":{"selector":{"version":"blue"}}}'
```

