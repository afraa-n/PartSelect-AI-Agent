# Operations Manual

## Monitoring & Observability

### Monitoring Setup

APM integration for metrics collection and error tracking.

#### Health Check Monitoring
```typescript
interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: ServiceStatus;
    ai: ServiceStatus;
    liveScraper: ServiceStatus;
    imageScraper: ServiceStatus;
    contactService: ServiceStatus;
    cache: ServiceStatus;
  };
  metrics: {
    responseTime: number;
    errorRate: number;
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
  };
  timestamp: string;
}

export async function performHealthCheck(): Promise<HealthCheckResult> {
  const checks = await Promise.allSettled([
    checkDatabaseConnection(),
    checkAIServiceHealth(),
    checkScrapingServiceHealth(),
    checkCacheHealth()
  ]);

  return {
    status: determineOverallStatus(checks),
    services: mapServiceStatuses(checks),
    metrics: await collectMetrics(),
    timestamp: new Date().toISOString()
  };
}
```

### Alerting Configuration

#### Critical Alerts
```yaml
# Example: Prometheus alerting rules
groups:
  - name: partselect-chat-critical
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected
          description: "Error rate is {{ $value }} for the last 5 minutes"

      - alert: DatabaseConnectionFailure
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: Database connection failed
          description: "PostgreSQL database is not responding"

      - alert: AIServiceDown
        expr: ai_service_health == 0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: AI service unavailable
          description: "Deepseek API is not responding, using fallback responses"
```

#### Warning Alerts
```yaml
  - name: partselect-chat-warnings
    rules:
      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: Slow API response times
          description: "95th percentile response time is {{ $value }}s"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.8
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: High memory usage
          description: "Memory usage is {{ $value | humanizePercentage }}"
```

## Log Management

### Structured Logging

#### Log Format Standards
```typescript
interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  service: string;
  requestId?: string;
  userId?: string;
  conversationId?: string;
  metadata?: Record<string, any>;
}

// Example logger implementation
export class Logger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, any>) {
    this.log('error', message, {
      ...metadata,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }

  private log(level: string, message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: level as any,
      message,
      service: this.serviceName,
      ...metadata
    };

    console.log(JSON.stringify(entry));
  }
}
```

#### Log Aggregation
```bash
# ELK Stack setup with Docker
version: '3.7'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.14.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:7.14.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:7.14.0
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

### Log Analysis Queries

#### Common Log Queries
```sql
-- Top error messages in last 24 hours
SELECT message, COUNT(*) as count
FROM logs
WHERE level = 'error' 
  AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY message
ORDER BY count DESC
LIMIT 10;

-- Slow API endpoints
SELECT 
  metadata->>'endpoint' as endpoint,
  AVG((metadata->>'responseTime')::numeric) as avg_response_time
FROM logs
WHERE level = 'info' 
  AND message = 'API Request Completed'
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY endpoint
HAVING AVG((metadata->>'responseTime')::numeric) > 500
ORDER BY avg_response_time DESC;

-- User error patterns
SELECT 
  metadata->>'userId' as user_id,
  COUNT(*) as error_count
FROM logs
WHERE level = 'error'
  AND timestamp > NOW() - INTERVAL '1 hour'
  AND metadata->>'userId' IS NOT NULL
GROUP BY user_id
HAVING COUNT(*) > 5
ORDER BY error_count DESC;
```

## Incident Response

### Incident Classification

#### Severity Levels
- **P1 (Critical)**: Complete service outage, data loss
- **P2 (High)**: Major feature broken, significant user impact
- **P3 (Medium)**: Minor feature issues, workaround available
- **P4 (Low)**: Cosmetic issues, no user impact

#### Response Times
- P1: 15min response, 1h resolution
- P2: 1h response, 4h resolution  
- P3: 4h response, 24h resolution
- P4: 24h response, 1w resolution

### Incident Procedures

#### P1 Incident Response
```bash
# Immediate actions (first 15 minutes)
1. Acknowledge incident in monitoring system
2. Create incident channel in Slack/Teams
3. Assess impact and scope
4. Implement immediate mitigation if possible
5. Notify stakeholders

# Investigation and resolution
6. Gather logs and metrics
7. Identify root cause
8. Implement fix or rollback
9. Verify resolution
10. Post-incident review scheduling
```

#### Common Incident Scenarios

**Database Connection Issues**
```bash
# Check database connectivity
npm run db:check

# Verify connection pool status
SELECT COUNT(*) FROM pg_stat_activity WHERE datname = 'your_database';

# Check for long-running queries
SELECT query, state, query_start 
FROM pg_stat_activity 
WHERE state != 'idle' 
ORDER BY query_start;

# Restart application if needed
docker-compose restart app
```

**AI Service Outage**
```bash
# Check API key validity
curl -H "Authorization: Bearer $DEEPSEEK_API_KEY" https://api.deepseek.com/health

# Verify fallback system activation
grep "Using mock response" /var/log/app.log

# Monitor error rates
curl http://localhost:5000/api/health | jq '.services.ai'
```

**High Memory Usage**
```bash
# Check memory usage
free -h
docker stats

# Identify memory-heavy processes
ps aux --sort=-%mem | head -10

# Check for memory leaks
node --inspect app.js
# Connect to Chrome DevTools for heap analysis

# Restart if necessary
pm2 restart app
```

## Performance Troubleshooting

### Database Performance

#### Query Optimization
```sql
-- Identify slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename = 'messages'
ORDER BY n_distinct DESC;

-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

-- Analyze table statistics
ANALYZE messages;
```

#### Connection Pool Monitoring
```typescript
// Monitor connection pool health
export async function monitorConnectionPool() {
  const poolStatus = await db.execute(`
    SELECT 
      numbackends as active_connections,
      numbackends * 100.0 / max_conn as connection_usage_percent
    FROM (
      SELECT COUNT(*) as numbackends
      FROM pg_stat_activity
      WHERE datname = current_database()
    ) current,
    (
      SELECT setting::int as max_conn
      FROM pg_settings
      WHERE name = 'max_connections'
    ) config
  `);

  return poolStatus.rows[0];
}
```

### Application Performance

#### Memory Leak Detection
```typescript
// Memory monitoring middleware
export function memoryMonitoringMiddleware(req: Request, res: Response, next: NextFunction) {
  const memUsage = process.memoryUsage();
  
  // Log memory usage periodically
  if (Date.now() % 60000 < 1000) { // Every minute
    console.log('Memory Usage:', {
      rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
      external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
    });
  }

  next();
}
```

#### Performance Profiling
```bash
# Generate heap snapshot
node --inspect app.js
# Connect to chrome://inspect and take heap snapshots

# CPU profiling
node --prof app.js
# Generate profile log, then process with:
node --prof-process isolate-*.log > processed.txt

# Flame graph generation
npm install -g clinic
clinic flame -- node app.js
```

## Backup & Recovery

### Database Backup Strategy

#### Automated Backups
```bash
#!/bin/bash
# Daily backup script

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATABASE_URL="your_connection_string"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$TIMESTAMP.sql

# Compress backup
gzip $BACKUP_DIR/backup_$TIMESTAMP.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Upload to cloud storage (optional)
aws s3 cp $BACKUP_DIR/backup_$TIMESTAMP.sql.gz s3://your-backup-bucket/
```

#### Backup Verification
```bash
# Test backup integrity
gunzip -c backup_$TIMESTAMP.sql.gz | head -100

# Restore to test database
createdb test_restore
gunzip -c backup_$TIMESTAMP.sql.gz | psql test_restore
```

### Disaster Recovery

#### Recovery Time Objectives (RTO)
- **Database Recovery**: 15 minutes
- **Application Recovery**: 30 minutes
- **Full Service Recovery**: 1 hour

#### Recovery Point Objectives (RPO)
- **Transaction Data**: 5 minutes (continuous replication)
- **Conversation Data**: 15 minutes (incremental backups)
- **Configuration Data**: 1 hour (full backups)

#### Recovery Procedures
```bash
# Database failover
1. Stop application services
2. Promote standby database
3. Update connection strings
4. Restart application services
5. Verify functionality

# Application rollback
1. Identify last known good version
2. Deploy previous container/image
3. Run database migrations (if needed)
4. Verify service health
5. Monitor for issues
```

## Security Operations

### Security Monitoring

#### Failed Authentication Attempts
```sql
-- Monitor login failures
SELECT 
  metadata->>'ip' as ip_address,
  COUNT(*) as failed_attempts
FROM logs
WHERE level = 'warn'
  AND message = 'Authentication Failed'
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
HAVING COUNT(*) > 5
ORDER BY failed_attempts DESC;
```

#### Suspicious Activity Detection
```typescript
// Rate limiting monitoring
export class SecurityMonitor {
  private suspiciousIPs = new Set<string>();

  async checkSuspiciousActivity(ip: string, endpoint: string) {
    const recentRequests = await this.getRecentRequests(ip, endpoint);
    
    if (recentRequests > 100) { // 100 requests per minute
      this.suspiciousIPs.add(ip);
      await this.alertSecurityTeam(ip, endpoint, recentRequests);
    }
  }

  async alertSecurityTeam(ip: string, endpoint: string, requestCount: number) {
    console.error('SECURITY ALERT', {
      type: 'HIGH_REQUEST_RATE',
      ip,
      endpoint,
      requestCount,
      timestamp: new Date().toISOString()
    });
  }
}
```

### Security Incident Response

#### Potential Security Incidents
- Unusual traffic patterns
- Multiple authentication failures
- SQL injection attempts
- Unauthorized API access
- Data exfiltration attempts

#### Response Procedures
```bash
# Immediate containment
1. Block suspicious IP addresses
2. Disable compromised accounts
3. Rotate API keys and secrets
4. Enable additional logging
5. Notify security team

# Investigation
6. Analyze access logs
7. Check for data exposure
8. Identify attack vectors
9. Assess impact scope
10. Document findings

# Recovery
11. Patch vulnerabilities
12. Update security controls
13. Monitor for persistence
14. Communicate with stakeholders
15. Conduct post-incident review
```

## Maintenance Procedures

### Routine Maintenance

#### Maintenance Schedule
- **Weekly**: Error logs, performance checks, backup verification
- **Monthly**: Capacity planning, credential rotation, security scans
- **Quarterly**: Major updates, security assessment, DR testing

### System Updates

#### Dependency Updates
```bash
# Check for outdated packages
npm audit
npm outdated

# Update patch versions
npm update

# Update major versions (with testing)
npm install package@latest
npm test
npm run test:e2e
```

#### Security Patches
```bash
# Apply security updates
npm audit fix

# Check for vulnerable packages
npm audit --audit-level high

# Manual verification
npm ls --depth=0 | grep vulnerable-package
```

### Data Maintenance

#### Database Cleanup
```sql
-- Archive old conversations (older than 1 year)
INSERT INTO conversations_archive 
SELECT * FROM conversations 
WHERE created_at < NOW() - INTERVAL '1 year';

DELETE FROM conversations 
WHERE created_at < NOW() - INTERVAL '1 year';

-- Optimize tables
VACUUM ANALYZE conversations;
VACUUM ANALYZE messages;

-- Update statistics
ANALYZE conversations;
ANALYZE messages;
```

#### Log Rotation
```bash
# Logrotate configuration
/var/log/partselect-chat/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 app app
    postrotate
        systemctl reload app
    endscript
}
```



