# Automatic Data Retention & Cleanup Feature

## Overview
The FarmTime application automatically deletes old records to maintain database performance and comply with data retention policies. Only the **last 2 months** of data is retained by default.

## What Gets Deleted

The following records are automatically cleaned up:
- **Attendance Records** - Older than 2 months
- **Payment Records** - Older than 2 months  
- **Time Off Records** - Older than 2 months

**Employee records are NEVER deleted** - only their historical data (attendance, payments, time-off).

## How It Works

### Automatic Cleanup
- **Schedule**: Runs daily at **2:00 AM**
- **Retention Period**: **2 months** (configurable)
- **Process**: 
  1. Calculates cutoff date (current date - 2 months)
  2. Deletes all attendance records before cutoff date
  3. Deletes all payment records before cutoff date
  4. Deletes all time-off records before cutoff date
  5. Logs the cleanup results

### Example
If today is **May 14, 2026**:
- Cutoff date: **March 14, 2026**
- All records before March 14, 2026 will be deleted
- Records from March 14, 2026 onwards are retained

## Configuration

### Application Properties
Located in: `/backend/src/main/resources/application.properties`

```properties
# Data Retention Configuration (in months)
data.retention.months=2

# Cleanup schedule: Run daily at 2 AM (cron: second minute hour day month weekday)
data.cleanup.cron=0 0 2 * * ?
```

### Customization Options

#### Change Retention Period
To keep data for 3 months instead of 2:
```properties
data.retention.months=3
```

#### Change Cleanup Schedule
To run at 3 AM instead of 2 AM:
```properties
data.cleanup.cron=0 0 3 * * ?
```

**Cron Expression Format**: `second minute hour day month weekday`

**Common Schedules**:
- Daily at 2 AM: `0 0 2 * * ?`
- Daily at midnight: `0 0 0 * * ?`
- Every Sunday at 3 AM: `0 0 3 ? * SUN`
- First day of month at 1 AM: `0 0 1 1 * ?`
- Every 6 hours: `0 0 */6 * * ?`

## Implementation Details

### Files Modified/Created

#### 1. DataCleanupService.java
Location: `/backend/src/main/java/com/farmtime/service/DataCleanupService.java`

**Key Features**:
- `@Scheduled` annotation for automatic execution
- Configurable retention period via `@Value`
- Transaction management with `@Transactional`
- Comprehensive logging
- Manual cleanup method

**Methods**:
```java
@Scheduled(cron = "${data.cleanup.cron:0 0 2 * * ?}")
public void cleanupOldData() // Automatic scheduled cleanup

public void manualCleanup() // Manual trigger via API
```

#### 2. AdminController.java (NEW)
Location: `/backend/src/main/java/com/farmtime/controller/AdminController.java`

**Endpoints**:
- `POST /api/admin/cleanup` - Manually trigger cleanup
- `GET /api/admin/cleanup/config` - Get current configuration

#### 3. Repository Updates
All repositories already had `deleteOldRecords()` methods:
- `AttendanceRepository.java`
- `PaymentRepository.java`
- `TimeOffRepository.java`

**Query Example**:
```java
@Modifying
@Query("DELETE FROM Attendance a WHERE a.attendanceDate < :cutoffDate")
void deleteOldRecords(@Param("cutoffDate") LocalDate cutoffDate);
```

#### 4. Application Properties
Updated: `/backend/src/main/resources/application.properties`
- Added `data.retention.months`
- Added `data.cleanup.cron`

## API Endpoints

### 1. Manual Cleanup Trigger
```http
POST http://localhost:8080/api/admin/cleanup
```

**Response**:
```json
{
  "message": "Data cleanup completed successfully",
  "cutoffDate": "2026-03-14",
  "retentionMonths": 2
}
```

### 2. Get Cleanup Configuration
```http
GET http://localhost:8080/api/admin/cleanup/config
```

**Response**:
```json
{
  "retentionMonths": 2,
  "cleanupSchedule": "0 0 2 * * ?",
  "cutoffDate": "2026-03-14",
  "description": "Records older than 2 months will be automatically deleted"
}
```

## Logging

The cleanup service logs all activities:

```
INFO  - Starting scheduled data cleanup (retention period: 2 months)...
INFO  - Deleted attendance records older than 2026-03-14
INFO  - Deleted payment records older than 2026-03-14
INFO  - Deleted time off records older than 2026-03-14
INFO  - Data cleanup completed successfully
```

**Log Location**: Console and application logs (configured via `logging.level.com.farmtime=DEBUG`)

## Testing

### Test Automatic Cleanup

1. **Wait for scheduled time** (2 AM by default)
2. **Check logs** for cleanup execution
3. **Verify data** - Query database to confirm old records are deleted

### Test Manual Cleanup

1. **Trigger via API**:
   ```bash
   curl -X POST http://localhost:8080/api/admin/cleanup
   ```

2. **Check response** for success message

3. **Verify in database**:
   ```sql
   -- Check oldest attendance record
   SELECT MIN(attendance_date) FROM attendance;
   
   -- Check oldest payment record
   SELECT MIN(payment_date) FROM payments;
   
   -- Check oldest time-off record
   SELECT MIN(start_date) FROM time_off;
   ```

### Test Configuration

1. **Get current config**:
   ```bash
   curl http://localhost:8080/api/admin/cleanup/config
   ```

2. **Verify response** shows correct retention period and schedule

## Database Impact

### Performance Benefits
- **Smaller tables** = Faster queries
- **Reduced storage** = Lower costs
- **Better indexes** = Improved performance
- **Faster backups** = Quicker recovery

### Data Volume Example
Assuming 10 employees with daily records:
- **Before**: 365 days × 10 employees = 3,650 records/year
- **After**: 60 days × 10 employees = 600 records (83% reduction)

## Safety Considerations

### What's Protected
✅ **Employee records** - Never deleted
✅ **Active employees** - Always retained
✅ **Recent data** (last 2 months) - Protected
✅ **User accounts** - Never deleted

### What's Deleted
❌ Old attendance records (>2 months)
❌ Old payment records (>2 months)
❌ Old time-off records (>2 months)

### Backup Recommendations
Before enabling in production:
1. **Take full database backup**
2. **Test on staging environment first**
3. **Export historical data** if needed for compliance
4. **Document retention policy** for your organization

## Disabling Cleanup

### Temporary Disable
Comment out the `@Scheduled` annotation in `DataCleanupService.java`:
```java
// @Scheduled(cron = "${data.cleanup.cron:0 0 2 * * ?}")
public void cleanupOldData() {
    // ...
}
```

### Permanent Disable
Set a very high retention period:
```properties
data.retention.months=120  # 10 years
```

Or remove `@EnableScheduling` from `FarmTimeApplication.java`:
```java
@SpringBootApplication
// @EnableScheduling  // Commented out
public class FarmTimeApplication {
    // ...
}
```

## Monitoring

### Check Last Cleanup
View application logs:
```bash
tail -f logs/application.log | grep "Data cleanup"
```

### Monitor Database Size
```sql
-- PostgreSQL
SELECT pg_size_pretty(pg_database_size('farmtime_db'));

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Alert on Failures
Check logs for errors:
```bash
grep "Error during data cleanup" logs/application.log
```

## Compliance & Legal

### Data Retention Policy
Document your organization's policy:
- **Retention Period**: 2 months
- **Deletion Schedule**: Daily at 2 AM
- **Scope**: Attendance, Payment, Time-off records
- **Exclusions**: Employee master data

### Audit Trail
All cleanup operations are logged with:
- Timestamp
- Cutoff date
- Number of records deleted (if needed, add counters)
- Success/failure status

## Troubleshooting

### Issue: Cleanup Not Running
**Check**:
1. Is `@EnableScheduling` present in `FarmTimeApplication.java`?
2. Is the application running at scheduled time?
3. Check logs for errors
4. Verify cron expression is valid

### Issue: Too Much Data Deleted
**Solution**:
1. Restore from backup
2. Increase `data.retention.months`
3. Review cron schedule

### Issue: Not Enough Data Deleted
**Solution**:
1. Check cutoff date calculation
2. Verify repository queries
3. Check transaction rollback issues
4. Manually trigger cleanup to test

## Future Enhancements

- [ ] Add record count logging (how many deleted)
- [ ] Email notifications after cleanup
- [ ] Archive old data before deletion
- [ ] Configurable retention per record type
- [ ] Soft delete with recovery period
- [ ] Admin dashboard for cleanup history
- [ ] Export old data to CSV before deletion

## Version History

- **v1.0** (2026-05-14): Initial implementation
  - 2-month retention period
  - Daily cleanup at 2 AM
  - Manual trigger API
  - Configuration endpoints

---

**Last Updated**: 2026-05-14
**Status**: ✅ Active and Running
