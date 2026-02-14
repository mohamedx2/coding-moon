# 🚨 SmartEdu AI - Disaster Recovery & Backup Strategy

## Executive Summary

This document outlines the comprehensive disaster recovery (DR) and backup strategy for SmartEdu AI. The strategy is designed to ensure business continuity with a Recovery Time Objective (RTO) of 2 hours and Recovery Point Objective (RPO) of 15 minutes.

---

## 1️⃣ Backup Strategy

### Database Backups (PostgreSQL)

**Automated Backup Schedule:**

| Backup Type | Frequency | Retention | Storage Location |
|-------------|-----------|-----------|------------------|
| **Full Backup** | Daily at 2 AM UTC | 30 days | S3 Standard-IA |
| **Incremental Backup** | Every 6 hours | 7 days | S3 Standard |
| **WAL Archiving** | Continuous | 7 days | S3 Standard |
| **Long-term Archive** | Weekly (Sunday) | 1 year | S3 Glacier |

**Backup Script:**

```bash
#!/bin/bash
# /opt/scripts/backup-postgres.sh

set -e

# Configuration
BACKUP_DIR="/var/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="smartedu"
S3_BUCKET="s3://smartedu-backups"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Full database backup
echo "Starting PostgreSQL backup..."
pg_dump -U postgres \
    -F c \
    -b \
    -v \
    -f "$BACKUP_DIR/smartedu_$TIMESTAMP.backup" \
    $DB_NAME

# Compress backup
echo "Compressing backup..."
gzip "$BACKUP_DIR/smartedu_$TIMESTAMP.backup"

# Encrypt backup
echo "Encrypting backup..."
gpg --encrypt \
    --recipient backup@smartedu.ai \
    "$BACKUP_DIR/smartedu_$TIMESTAMP.backup.gz"

# Upload to S3
echo "Uploading to S3..."
aws s3 cp \
    "$BACKUP_DIR/smartedu_$TIMESTAMP.backup.gz.gpg" \
    "$S3_BUCKET/postgres/daily/" \
    --storage-class STANDARD_IA \
    --server-side-encryption AES256

# Verify upload
aws s3 ls "$S3_BUCKET/postgres/daily/smartedu_$TIMESTAMP.backup.gz.gpg"

# Cleanup local backups older than 7 days
find $BACKUP_DIR -name "*.backup.gz.gpg" -mtime +7 -delete

# Cleanup S3 backups older than retention period
aws s3 ls "$S3_BUCKET/postgres/daily/" | \
    awk '{print $4}' | \
    while read file; do
        file_date=$(echo $file | grep -oP '\d{8}')
        if [ $(date -d "$file_date" +%s) -lt $(date -d "$RETENTION_DAYS days ago" +%s) ]; then
            aws s3 rm "$S3_BUCKET/postgres/daily/$file"
        fi
    done

echo "Backup completed successfully"

# Send notification
curl -X POST $SLACK_WEBHOOK_URL \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"✅ PostgreSQL backup completed: smartedu_$TIMESTAMP.backup.gz.gpg\"}"
```

**Cron Schedule:**
```cron
# Full backup daily at 2 AM UTC
0 2 * * * /opt/scripts/backup-postgres.sh >> /var/log/backup.log 2>&1

# Incremental backup every 6 hours
0 */6 * * * /opt/scripts/backup-postgres-incremental.sh >> /var/log/backup.log 2>&1
```

### WAL (Write-Ahead Log) Archiving

**PostgreSQL Configuration:**
```conf
# postgresql.conf

# Enable WAL archiving for point-in-time recovery
wal_level = replica
archive_mode = on
archive_command = 'aws s3 cp %p s3://smartedu-backups/postgres/wal/%f --storage-class STANDARD'
archive_timeout = 300  # Archive every 5 minutes

# Replication settings
max_wal_senders = 3
wal_keep_size = 1GB
```

### Application Data Backups

**User Uploads (S3):**
- **Versioning**: Enabled on S3 bucket
- **Lifecycle Policy**: 
  - Current version: Retained indefinitely
  - Non-current versions: Deleted after 30 days
- **Cross-Region Replication**: Enabled to `us-west-2`

**Redis Data:**
- **RDB Snapshots**: Every 6 hours
- **AOF (Append-Only File)**: Enabled for durability
- **Backup Location**: S3 bucket

```bash
#!/bin/bash
# Backup Redis data

TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Trigger Redis save
docker exec smartedu-redis redis-cli BGSAVE

# Wait for save to complete
while [ $(docker exec smartedu-redis redis-cli LASTSAVE) -eq $LAST_SAVE ]; do
    sleep 1
done

# Copy RDB file
docker cp smartedu-redis:/data/dump.rdb /var/backups/redis/dump_$TIMESTAMP.rdb

# Upload to S3
aws s3 cp /var/backups/redis/dump_$TIMESTAMP.rdb \
    s3://smartedu-backups/redis/ \
    --storage-class STANDARD_IA
```

### Configuration Backups

**Automated Git Backups:**
```bash
#!/bin/bash
# Backup configuration files

cd /opt/smartedu
git add devops/ docs/ docker-compose.prod.yml
git commit -m "Automated config backup $(date +%Y-%m-%d)"
git push origin main
```

---

## 2️⃣ Backup Verification

### Automated Restore Testing

**Monthly Restore Test:**
```bash
#!/bin/bash
# /opt/scripts/test-restore.sh

# Download latest backup
LATEST_BACKUP=$(aws s3 ls s3://smartedu-backups/postgres/daily/ | sort | tail -n 1 | awk '{print $4}')
aws s3 cp "s3://smartedu-backups/postgres/daily/$LATEST_BACKUP" /tmp/

# Decrypt
gpg --decrypt "/tmp/$LATEST_BACKUP" > /tmp/backup.gz

# Decompress
gunzip /tmp/backup.gz

# Restore to test database
createdb smartedu_test
pg_restore -U postgres -d smartedu_test /tmp/backup

# Verify data integrity
psql -U postgres -d smartedu_test -c "SELECT COUNT(*) FROM users;"
psql -U postgres -d smartedu_test -c "SELECT COUNT(*) FROM courses;"

# Cleanup
dropdb smartedu_test
rm /tmp/backup /tmp/$LATEST_BACKUP

echo "Restore test completed successfully"
```

**Cron Schedule:**
```cron
# Test restore on the 1st of every month
0 3 1 * * /opt/scripts/test-restore.sh >> /var/log/restore-test.log 2>&1
```

---

## 3️⃣ Disaster Recovery Procedures

### Scenario 1: Database Corruption

**Detection:**
- PostgreSQL crashes or refuses connections
- Data integrity check failures
- Replication lag alerts

**Recovery Steps:**

1. **Assess Damage**
   ```bash
   # Check PostgreSQL logs
   tail -f /var/log/postgresql/postgresql.log
   
   # Check database status
   psql -U postgres -c "SELECT pg_is_in_recovery();"
   ```

2. **Stop Application**
   ```bash
   # Stop backend to prevent writes
   docker-compose stop backend ai-worker
   ```

3. **Restore from Backup**
   ```bash
   # Download latest backup
   LATEST_BACKUP=$(aws s3 ls s3://smartedu-backups/postgres/daily/ | sort | tail -n 1 | awk '{print $4}')
   aws s3 cp "s3://smartedu-backups/postgres/daily/$LATEST_BACKUP" /tmp/
   
   # Decrypt and decompress
   gpg --decrypt "/tmp/$LATEST_BACKUP" | gunzip > /tmp/backup
   
   # Drop and recreate database
   dropdb smartedu
   createdb smartedu
   
   # Restore
   pg_restore -U postgres -d smartedu /tmp/backup
   ```

4. **Point-in-Time Recovery (if needed)**
   ```bash
   # Restore WAL files
   aws s3 sync s3://smartedu-backups/postgres/wal/ /var/lib/postgresql/wal/
   
   # Configure recovery
   cat > /var/lib/postgresql/data/recovery.conf <<EOF
   restore_command = 'cp /var/lib/postgresql/wal/%f %p'
   recovery_target_time = '2024-02-13 14:30:00'
   EOF
   
   # Start PostgreSQL (will replay WAL)
   systemctl start postgresql
   ```

5. **Verify Data**
   ```bash
   psql -U postgres -d smartedu -c "SELECT COUNT(*) FROM users;"
   psql -U postgres -d smartedu -c "SELECT MAX(created_at) FROM users;"
   ```

6. **Restart Application**
   ```bash
   docker-compose up -d backend ai-worker
   ```

**Expected Recovery Time:** 30-60 minutes  
**Data Loss:** < 15 minutes (last WAL archive)

---

### Scenario 2: Complete Region Failure (AWS us-east-1)

**Detection:**
- All services unreachable
- AWS status page shows region outage
- Health checks failing across all AZs

**Recovery Steps:**

1. **Activate DR Region (us-west-2)**
   ```bash
   # Switch DNS to DR region
   aws route53 change-resource-record-sets \
       --hosted-zone-id Z1234567890ABC \
       --change-batch '{
           "Changes": [{
               "Action": "UPSERT",
               "ResourceRecordSet": {
                   "Name": "smartedu.ai",
                   "Type": "A",
                   "AliasTarget": {
                       "HostedZoneId": "Z0987654321XYZ",
                       "DNSName": "smartedu-dr.us-west-2.elb.amazonaws.com",
                       "EvaluateTargetHealth": true
                   }
               }
           }]
       }'
   ```

2. **Promote Read Replica to Primary**
   ```bash
   # Promote RDS read replica in us-west-2
   aws rds promote-read-replica \
       --db-instance-identifier smartedu-replica-west \
       --region us-west-2
   ```

3. **Start Application Services**
   ```bash
   # Deploy containers in DR region
   ssh dr-server.us-west-2
   cd /opt/smartedu
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Verify Services**
   ```bash
   curl https://smartedu.ai/health
   curl https://smartedu.ai/api/health
   ```

5. **Monitor and Communicate**
   - Post status update on status page
   - Send email to all users
   - Monitor error rates and performance

**Expected Recovery Time:** 15-30 minutes  
**Data Loss:** Minimal (read replica lag < 5 seconds)

---

### Scenario 3: Ransomware Attack

**Detection:**
- Encrypted files detected
- Unusual file modifications
- Ransom note found

**Immediate Actions:**

1. **Isolate Systems**
   ```bash
   # Disconnect from network
   sudo iptables -A INPUT -j DROP
   sudo iptables -A OUTPUT -j DROP
   
   # Stop all services
   docker-compose down
   ```

2. **Preserve Evidence**
   ```bash
   # Create disk image
   dd if=/dev/sda of=/mnt/forensics/disk-image.img bs=4M
   
   # Capture memory dump
   sudo dd if=/dev/mem of=/mnt/forensics/memory.dump
   ```

3. **Notify Authorities**
   - Contact FBI Cyber Division
   - File incident report
   - Notify cyber insurance provider

4. **Restore from Clean Backup**
   ```bash
   # Provision new servers
   terraform apply -var="environment=recovery"
   
   # Restore from backup taken BEFORE infection
   # Use backup from 7 days ago (before ransomware)
   aws s3 cp s3://smartedu-backups/postgres/daily/smartedu_20240206_020000.backup.gz.gpg /tmp/
   
   # Restore database
   gpg --decrypt /tmp/smartedu_20240206_020000.backup.gz.gpg | gunzip | pg_restore -U postgres -d smartedu
   
   # Deploy application
   docker-compose up -d
   ```

5. **Security Hardening**
   - Change all passwords and API keys
   - Rotate JWT secrets
   - Update firewall rules
   - Enable additional monitoring

**Expected Recovery Time:** 2-4 hours  
**Data Loss:** Up to 7 days (depending on infection timeline)

---

## 4️⃣ Failover Strategy

### Database Failover (PostgreSQL)

**Automatic Failover with Patroni:**

```yaml
# patroni.yml
scope: smartedu
namespace: /service/
name: postgres-1

restapi:
  listen: 0.0.0.0:8008
  connect_address: postgres-1:8008

etcd:
  hosts: etcd-1:2379,etcd-2:2379,etcd-3:2379

bootstrap:
  dcs:
    ttl: 30
    loop_wait: 10
    retry_timeout: 10
    maximum_lag_on_failover: 1048576
    postgresql:
      use_pg_rewind: true
      parameters:
        max_connections: 200
        shared_buffers: 2GB

postgresql:
  listen: 0.0.0.0:5432
  connect_address: postgres-1:5432
  data_dir: /var/lib/postgresql/data
  authentication:
    replication:
      username: replicator
      password: ${REPLICATION_PASSWORD}
    superuser:
      username: postgres
      password: ${POSTGRES_PASSWORD}
```

**Failover Process:**
1. Patroni detects primary failure (< 30 seconds)
2. Elects new primary from replicas
3. Promotes replica to primary
4. Updates DNS/load balancer
5. Redirects traffic to new primary

**Total Failover Time:** < 2 minutes

### Application Failover

**Multi-AZ Deployment:**
- Load balancer health checks every 10 seconds
- Unhealthy instances removed from rotation
- Auto-scaling launches replacement instances
- Zero downtime for users

---

## 5️⃣ Backup Retention Policy

| Data Type | Daily | Weekly | Monthly | Yearly |
|-----------|-------|--------|---------|--------|
| **Database** | 30 days | 12 weeks | 12 months | 7 years |
| **User Files** | 30 days | 12 weeks | 12 months | 7 years |
| **Logs** | 7 days | 4 weeks | 6 months | - |
| **Metrics** | 30 days | 12 weeks | 12 months | - |
| **Configuration** | Git history (indefinite) | | | |

### S3 Lifecycle Policy

```json
{
  "Rules": [
    {
      "Id": "TransitionToIA",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        },
        {
          "Days": 365,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ],
      "Expiration": {
        "Days": 2555
      }
    }
  ]
}
```

---

## 6️⃣ Recovery Time & Point Objectives

| Scenario | RTO | RPO | Priority |
|----------|-----|-----|----------|
| **Single container failure** | < 1 minute | 0 | P0 |
| **Database corruption** | < 1 hour | < 15 minutes | P0 |
| **AZ failure** | < 5 minutes | 0 | P0 |
| **Region failure** | < 30 minutes | < 5 minutes | P1 |
| **Ransomware attack** | < 4 hours | < 7 days | P1 |
| **Complete data loss** | < 24 hours | < 1 day | P2 |

---

## 7️⃣ Disaster Recovery Checklist

### Pre-Disaster Preparation
- [x] Automated backups configured
- [x] Backup verification tests scheduled
- [x] DR runbooks documented
- [x] DR region configured
- [x] Failover procedures tested
- [x] Team trained on DR procedures
- [x] Contact list updated
- [x] Incident response plan documented

### During Disaster
- [ ] Assess severity and impact
- [ ] Activate incident response team
- [ ] Execute appropriate DR procedure
- [ ] Communicate with stakeholders
- [ ] Document all actions taken
- [ ] Monitor recovery progress

### Post-Disaster
- [ ] Conduct post-mortem analysis
- [ ] Update DR procedures
- [ ] Implement preventive measures
- [ ] Test restored systems
- [ ] Notify users of resolution
- [ ] Update documentation

---

## 8️⃣ Contact Information

### Incident Response Team

| Role | Name | Phone | Email |
|------|------|-------|-------|
| **Incident Commander** | [Name] | [Phone] | [Email] |
| **Database Admin** | [Name] | [Phone] | [Email] |
| **DevOps Lead** | [Name] | [Phone] | [Email] |
| **Security Lead** | [Name] | [Phone] | [Email] |
| **CTO** | [Name] | [Phone] | [Email] |

### External Contacts

- **AWS Support**: 1-800-xxx-xxxx (Enterprise Support)
- **Cyber Insurance**: [Provider] - [Phone]
- **Legal Counsel**: [Firm] - [Phone]
- **PR/Communications**: [Agency] - [Phone]

---

## 9️⃣ Testing Schedule

| Test Type | Frequency | Last Tested | Next Test |
|-----------|-----------|-------------|-----------|
| **Backup Restore** | Monthly | 2024-02-01 | 2024-03-01 |
| **Database Failover** | Quarterly | 2024-01-15 | 2024-04-15 |
| **DR Region Activation** | Annually | 2023-12-01 | 2024-12-01 |
| **Ransomware Simulation** | Annually | 2023-11-01 | 2024-11-01 |
| **Full DR Drill** | Annually | 2023-10-01 | 2024-10-01 |

---

**Next Steps:**
1. Review [Production Hardening Checklist](./04-production-hardening.md)
2. Review [Monitoring Setup](../devops/monitoring/README.md)
3. Schedule DR drill with team
