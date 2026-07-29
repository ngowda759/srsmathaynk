# Disaster Recovery Plan
## SRS Math Temple Portal

**Document Version:** 1.0  
**Last Updated:** 2024  
**Owner:** DevOps Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Recovery Objectives](#recovery-objectives)
3. [Backup Strategy](#backup-strategy)
4. [Restore Procedures](#restore-procedures)
5. [Storage Recovery](#storage-recovery)
6. [Monitoring & Failover](#monitoring--failover)
7. [Rollback Process](#rollback-process)
8. [Incident Response](#incident-response)
9. [Testing Schedule](#testing-schedule)

---

## Executive Summary

This document outlines the disaster recovery plan for the SRS Math Temple Portal. The plan ensures business continuity by establishing clear procedures for data backup, restoration, and system recovery in case of failures or disasters.

### Key Objectives
- Minimize data loss and downtime
- Ensure data integrity
- Provide clear recovery procedures
- Enable quick service restoration

---

## Recovery Objectives

### Recovery Point Objective (RPO)
| Data Type | RPO | Rationale |
|-----------|-----|-----------|
| Database (PostgreSQL) | 4 hours | Daily backups + continuous WAL archiving |
| User uploads (Supabase Storage) | 24 hours | Daily replication |
| Configuration files | Real-time | Git version control |
| Application code | Real-time | Git version control |

### Recovery Time Objective (RTO)
| Service | RTO | Priority |
|---------|-----|----------|
| Database restoration | 2 hours | Critical |
| Storage restoration | 4 hours | High |
| Application deployment | 30 minutes | Critical |
| Full system restoration | 4 hours | High |

---

## Backup Strategy

### 3-2-1 Backup Rule
- **3** copies of data
- **2** different storage media
- **1** offsite backup

### Backup Types

#### 1. Database Backups

```bash
# Full Database Backup (Daily at 2:00 AM)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/database"
RETENTION_DAYS=30

# Create backup
pg_dump -Fc -h localhost -U postgres srsmatha > "$BACKUP_DIR/full_backup_$DATE.dump"

# Compress
gzip "$BACKUP_DIR/full_backup_$DATE.dump"

# Remove old backups
find "$BACKUP_DIR" -name "*.dump.gz" -mtime +$RETENTION_DAYS -delete

# Upload to S3
aws s3 cp "$BACKUP_DIR/full_backup_$DATE.dump.gz" s3://srsmatha-backups/database/
```

#### 2. Incremental Backups (Every 4 hours)

```bash
#!/bin/bash
# PostgreSQL WAL Archival for Point-in-Time Recovery
# Configure in postgresql.conf:
# wal_level = replica
# archive_mode = on
# archive_command = 'aws s3 cp %p s3://srsmatha-backups/wal/%f'
```

#### 3. Supabase Storage Backup

```bash
#!/bin/bash
# Sync storage to backup bucket
supabase db dump --db-url $DATABASE_URL > backup.sql
aws s3 sync s3://srsmatha-storage/media s3://srsmatha-backups/media --delete
```

### Backup Schedule

| Backup Type | Frequency | Time | Retention |
|-------------|-----------|------|-----------|
| Full Database | Daily | 02:00 IST | 30 days |
| Incremental (WAL) | Continuous | Real-time | 7 days |
| Storage (Media) | Daily | 03:00 IST | 30 days |
| Weekly Archive | Weekly | Sunday 04:00 | 12 weeks |
| Monthly Archive | Monthly | 1st Sunday | 12 months |

---

## Restore Procedures

### Database Restore

#### Option 1: Full Restore from Latest Backup

```bash
#!/bin/bash
# Restore procedure for PostgreSQL

BACKUP_FILE=$1  # Pass backup file name
TARGET_DB="srsmatha_restore"

echo "Starting database restore from: $BACKUP_FILE"

# Stop application
pm2 stop temple-portal

# Drop existing connections
psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$TARGET_DB';"
psql -c "DROP DATABASE IF EXISTS $TARGET_DB;"

# Create database
psql -c "CREATE DATABASE $TARGET_DB;"

# Restore
pg_restore -Fc -d $TARGET_DB -v "/backups/database/$BACKUP_FILE"

# Verify
psql -d $TARGET_DB -c "SELECT COUNT(*) FROM \"Profile\";"

# Restart application
pm2 start temple-portal

echo "Restore completed successfully!"
```

#### Option 2: Point-in-Time Recovery (PITR)

```bash
#!/bin/bash
# Point-in-time recovery

TARGET_TIME="2024-01-15 14:30:00 IST"
TARGET_DB="srsmatha_pitr"

# Create recovery.conf (in PostgreSQL 12+ use restore_command)
psql -c "DROP DATABASE IF EXISTS $TARGET_DB;"
psql -c "CREATE DATABASE $TARGET_DB;"

# Use pg_restore with point-in-time
pg_restore -Fc -d $TARGET_DB \
  --no-owner \
  --role=postgres \
  "/backups/database/latest.dump"

# Apply WAL to point in time
# PostgreSQL handles this automatically with recovery_target_time
```

#### Option 3: Selective Table Restore

```bash
#!/bin/bash
# Restore specific tables from backup

BACKUP_FILE="/backups/database/full_backup_20240115.dump"
TABLES="announcement,galleryAlbum,event"

for TABLE in $(echo $TABLES | tr "," "\n"); do
  echo "Restoring table: $TABLE"
  
  # Export specific table
  pg_restore -Fc -t $TABLE -d srsmatha "$BACKUP_FILE"
done
```

### Verification After Restore

```sql
-- Verify data integrity
SELECT 
  schemaname, 
  tablename, 
  n_live_tup as row_count,
  n_dead_tup as dead_rows
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Check for inconsistencies
SELECT COUNT(*) FROM "Profile" WHERE "deletedAt" IS NOT NULL AND "deletedAt" > NOW();
```

---

## Storage Recovery

### Supabase Storage Recovery

```bash
#!/bin/bash
# Storage recovery from backup

# List available backups
aws s3 ls s3://srsmatha-backups/media/

# Restore specific folder
aws s3 sync s3://srsmatha-backups/media/2024-01-15/ \
  s3://srsmatha-storage/media/ \
  --delete

# Verify restored files
aws s3 ls s3://srsmatha-storage/media/ | head -20
```

### Media Files Recovery Priority

| Priority | Content | RTO |
|----------|---------|-----|
| 1 | Temple images | 2 hours |
| 2 | Festival photos | 4 hours |
| 3 | Documents | 24 hours |
| 4 | Archive videos | 72 hours |

---

## Monitoring & Failover

### Health Monitoring

```typescript
// lib/monitoring/health-checks.ts
export interface HealthCheck {
  name: string
  status: 'healthy' | 'degraded' | 'down'
  responseTime: number
  lastCheck: Date
}

export async function performHealthCheck(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = []

  // Database check
  checks.push(await checkDatabase())
  
  // Storage check
  checks.push(await checkStorage())
  
  // API check
  checks.push(await checkAPI())
  
  // External services
  checks.push(await checkExternalServices())

  return checks
}

async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return {
      name: 'database',
      status: 'healthy',
      responseTime: Date.now() - start,
      lastCheck: new Date(),
    }
  } catch {
    return {
      name: 'database',
      status: 'down',
      responseTime: Date.now() - start,
      lastCheck: new Date(),
    }
  }
}
```

### Automatic Failover Setup

```yaml
# vercel.json - Edge configuration
{
  "regions": ["bom1", "maa1"],
  "failover": true,
  "healthCheck": "/api/health"
}
```

### Alerting Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Response Time | > 500ms | > 2000ms |
| Error Rate | > 1% | > 5% |
| CPU Usage | > 70% | > 90% |
| Memory Usage | > 80% | > 95% |
| Disk Usage | > 80% | > 95% |

### Monitoring Tools

| Tool | Purpose | Alert Channel |
|------|---------|---------------|
| Vercel Analytics | Performance monitoring | Dashboard |
| Supabase Dashboard | Database monitoring | Email |
| UptimeRobot | Uptime monitoring | SMS/Email |
| Sentry | Error tracking | Slack/Email |
| PagerDuty | Incident management | Phone/SMS |

---

## Rollback Process

### Application Rollback

#### Via Git (Safe Rollback)

```bash
#!/bin/bash
# Rollback to previous deployment

# List recent deployments
vercel list

# Rollback to specific deployment
vercel rollback [deployment-url]

# Or rollback via git
git revert HEAD
git push origin main
```

#### Via Vercel Dashboard

1. Go to Vercel Dashboard
2. Select project
3. Click "Deployments"
4. Select working deployment
5. Click "..." menu
6. Select "Promote to Production"

### Database Migration Rollback

```bash
#!/bin/bash
# Rollback last migration

# Get current migration status
prisma migrate status

# Rollback last migration
prisma migrate rollback

# Verify
prisma migrate status
```

### Configuration Rollback

```bash
#!/bin/bash
# Rollback environment variables

# Backup current
vercel env pull .env.backup

# Restore from git (if stored)
git checkout HEAD -- .env.example

# Manually restore critical values
```

---

## Incident Response

### Incident Severity Levels

| Level | Definition | Response Time | Examples |
|-------|------------|---------------|----------|
| SEV1 | Complete outage | 15 minutes | Site down, data loss |
| SEV2 | Major feature broken | 30 minutes | Login broken, payments failing |
| SEV3 | Minor feature broken | 2 hours | Search not working |
| SEV4 | Low impact | 24 hours | UI glitch, minor bug |

### Incident Response Workflow

```
┌─────────────────────────────────────────────────────────┐
│                    INCIDENT DETECTED                     │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    ASSESS SEVERITY                       │
│  SEV1/SEV2 → Page on-call immediately                   │
│  SEV3/SEV4 → Notify via Slack within 2 hours             │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  INITIAL RESPONSE                        │
│  • Acknowledge incident                                 │
│  • Create incident channel                              │
│  • Assign incident commander                            │
│  • Start incident timeline                              │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   MITIGATION                             │
│  • Implement temporary fix if available                  │
│  • Rollback if deployment-related                        │
│  • Scale resources if needed                            │
│  • Communicate status to stakeholders                    │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   RESOLUTION                              │
│  • Verify fix is working                                │
│  • Monitor for 30 minutes                               │
│  • Update status page                                   │
│  • Close incident                                       │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    POST-INCIDENT                         │
│  • Schedule post-mortem                                 │
│  • Document lessons learned                             │
│  • Implement permanent fix                              │
│  • Update runbooks                                      │
└─────────────────────────────────────────────────────────┘
```

### Incident Communication Template

**Status Page Update:**
```
[RESOLVED] [Service Name] - [Brief Description]
Date: [Date] | Time: [Time] IST
Duration: [X hours Y minutes]

Impact: [Who was affected]
Root Cause: [Brief explanation]
Resolution: [What was done]
Next Steps: [What remains]
```

### Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| On-Call Engineer | TBD | TBD | oncall@srsmatha.org |
| DevOps Lead | TBD | TBD | devops@srsmatha.org |
| Tech Lead | TBD | TBD | tech@srsmatha.org |
| External Support | Vercel | N/A | support@vercel.com |

---

## Testing Schedule

### Weekly Tests
- Backup verification (automated)
- Restore procedure dry-run (manual)

### Monthly Tests
- Full database restore to staging
- Storage restore verification
- Rollback procedure testing

### Quarterly Tests
- Complete DR simulation
- Full system failover test
- All team members trained on DR procedures

### Test Report Template

```markdown
# DR Test Report - [Date]

## Test Type
[Full DR / Partial / Rollback]

## Results
- Database Restore: ✅/❌ (Duration: X minutes)
- Storage Restore: ✅/❌ (Duration: X minutes)
- Application Deploy: ✅/❌ (Duration: X minutes)

## Issues Found
1. [Issue description]

## Lessons Learned
1. [Lesson learned]

## Sign-off
- [Name] - [Date]
```

---

## Appendix A: Quick Reference Cards

### Emergency Response Card

```
┌────────────────────────────────────┐
│      EMERGENCY CONTACTS             │
├────────────────────────────────────┤
│ On-Call:    [PHONE]                │
│ DevOps:     [PHONE]                │
│ Vercel:     support@vercel.com     │
├────────────────────────────────────┤
│ IMPORTANT URLS                      │
├────────────────────────────────────┤
│ Status Page: [URL]                 │
│ Vercel:     [URL]                 │
│ Supabase:   [URL]                 │
│ Logs:       [URL]                 │
└────────────────────────────────────┘
```

### Quick Rollback Commands

```bash
# 1. Stop the bleeding - rollback app
vercel rollback

# 2. Check database
psql -c "SELECT version();"

# 3. Verify backups exist
ls -la /backups/database/*.dump.gz | head -5

# 4. Check monitoring
# Open Vercel dashboard for error logs
```

---

## Appendix B: Runbook Index

| Runbook | Location |
|---------|----------|
| Database Backup | `/scripts/backup-db.sh` |
| Database Restore | `/scripts/restore-db.sh` |
| Storage Backup | `/scripts/backup-storage.sh` |
| Application Deploy | `/scripts/deploy.sh` |
| Rollback | `/scripts/rollback.sh` |
| Health Check | `/scripts/health-check.sh` |

---

*Document Control*  
**Approved By:** TBD  
**Review Schedule:** Quarterly  
**Next Review:** 2024-04-01
