# Data Cleanup Schedule - Complete Guide

## 📅 When Does Cleanup Run?

**ONE DAY AFTER PAYDAY at 2:00 AM**

### Examples:
- **Payday = 10th** → Cleanup runs on **11th at 2:00 AM**
- **Payday = 15th** → Cleanup runs on **16th at 2:00 AM**
- **Payday = 31st** (in Feb) → Cleanup runs on **1st March at 2:00 AM**

### Why One Day After Payday?
- Payday (10th) is when salary processing happens
- Giving one day buffer ensures all salary processing is complete
- Cleanup on 11th is safe - no interference with salary operations

---

## 🗑️ What Gets Deleted?

### Retention Policy: **2 Months**

All data older than 2 months from cleanup date gets deleted:

1. **Attendance Records** - Simple date-based deletion
2. **Payment Records** - Cycle-aware deletion (keeps complete cycles)
3. **Time-Off Records** - Simple date-based deletion

### Example Scenario:
```
Today: 11-May-2026 (one day after payday)
Retention: 2 months
Cutoff Date: 11-Mar-2026

What gets deleted:
✓ Attendance records with date < 11-Mar-2026
✓ Payment cycles that ENDED before 11-Mar-2026
✓ Time-off records with date < 11-Mar-2026

What gets kept:
✗ All data from 11-Mar-2026 onwards
✗ Current and recent salary cycles
```

---

## 🛡️ Payment Cycle Protection

### Critical Safety Feature:
**Payment data is NEVER partially deleted**

### How It Works:

```
Cleanup Date: 11-May-2026
Simple Cutoff: 11-Mar-2026
Payday: 10th

Salary Cycles:
- Cycle 1: 11-Jan to 10-Feb ← COMPLETE (ended 10-Feb)
- Cycle 2: 11-Feb to 10-Mar ← COMPLETE (ended 10-Mar)
- Cycle 3: 11-Mar to 10-Apr ← PARTIAL (started 11-Mar, after cutoff)
- Cycle 4: 11-Apr to 10-May ← CURRENT

Cycle-Aware Logic:
1. Simple cutoff is 11-Mar
2. 11-Mar falls in Cycle 3 (11-Mar to 10-Apr)
3. Can't delete partial Cycle 3
4. Go back to previous complete cycle
5. Safe cutoff = 10-Mar (end of Cycle 2)

Result:
✓ Cycle 1 (ended 10-Feb): DELETED
✓ Cycle 2 (ended 10-Mar): DELETED
✗ Cycle 3 (11-Mar to 10-Apr): KEPT (complete cycle preserved)
✗ Cycle 4 (current): KEPT
```

### Why This Matters:

**Without cycle protection:**
```
Employee: Rajesh
Cycle: 11-Mar to 10-Apr
- Advance on 15-Mar: ₹1,000
- Salary on 10-Apr: ₹9,000

Simple deletion (cutoff 11-Mar):
- Deletes advance (15-Mar > 11-Mar) ❌
- Keeps salary (10-Apr > 11-Mar) ✓

Report shows:
- Paid: ₹9,000
- Remaining: ₹1,000
- WRONG! Actually paid ₹10,000
```

**With cycle protection:**
```
Cycle-aware deletion:
- Keeps entire cycle (11-Mar to 10-Apr) ✓
- Both advance and salary preserved ✓

Report shows:
- Paid: ₹10,000
- Remaining: ₹0
- CORRECT!
```

---

## ⏰ Cleanup Schedule

### Cron Expression:
```
0 0 2 * * ?
```

**Breakdown:**
- `0` - Second: 0
- `0` - Minute: 0
- `2` - Hour: 2 AM
- `*` - Day: Every day
- `*` - Month: Every month
- `?` - Day of week: Any

### Actual Execution:
```
Scheduler runs: Daily at 2:00 AM
Checks: Is today one day after payday?
If YES: Runs cleanup
If NO: Skips cleanup
```

### Monthly Pattern (Payday = 10th):
```
Date    | Day After Payday? | Cleanup Runs?
--------|-------------------|---------------
10-May  | No (payday)       | No
11-May  | YES               | YES ✓
12-May  | No                | No
13-May  | No                | No
...
10-Jun  | No (payday)       | No
11-Jun  | YES               | YES ✓
```

**Result:** Cleanup runs **once per month** on the 11th (if payday is 10th)

---

## 📊 Cleanup Process Flow

### Step-by-Step:

```
1. Scheduler triggers at 2:00 AM
   ↓
2. Check: Is today one day after payday?
   ↓
   NO → Skip cleanup, log message, exit
   YES → Continue
   ↓
3. Calculate cutoff date (today - 2 months)
   ↓
4. Delete Attendance Records
   - Simple date-based deletion
   - Delete all records older than cutoff
   ↓
5. Delete Payment Records (Cycle-Aware)
   - Find which cycle cutoff date falls into
   - Adjust to previous complete cycle end
   - Delete only complete cycles
   ↓
6. Delete Time-Off Records
   - Simple date-based deletion
   - Delete all records older than cutoff
   ↓
7. Log results (count of deleted records)
   ↓
8. Complete
```

---

## 📝 Log Examples

### Normal Cleanup Day (11th):
```
2026-05-11 02:00:00 INFO  - Starting scheduled data cleanup (retention period: 2 months)...
2026-05-11 02:00:01 INFO  - Deleted 450 attendance records older than 2026-03-11
2026-05-11 02:00:01 INFO  - Payment cleanup: Simple cutoff=2026-03-11, Current cycle=2026-03-11 to 2026-04-10, Safe cutoff=2026-03-10 (previous cycle end)
2026-05-11 02:00:02 INFO  - Deleted 89 payment records older than 2026-03-10 (cycle-safe date)
2026-05-11 02:00:02 INFO  - Deleted 23 time-off records older than 2026-03-11
2026-05-11 02:00:02 INFO  - Data cleanup completed successfully - Retention: 2 months, Cutoff: 2026-03-11
```

### Non-Cleanup Day (12th):
```
2026-05-12 02:00:00 INFO  - Skipping data cleanup - Today is not one day after payday. Cleanup runs only on day after payday.
```

### Payday (10th):
```
2026-05-10 02:00:00 INFO  - Skipping data cleanup - Today is not one day after payday. Cleanup runs only on day after payday.
```

---

## 🔧 Configuration

### application-aws.properties:
```properties
# Data Retention Configuration
# Cleanup runs ONE DAY AFTER PAYDAY at 2:00 AM
# Retains data for specified number of months (default: 2 months)
data.retention.months=2
data.cleanup.cron=0 0 2 * * ?

# Salary Configuration
salary.payday=10
```

### Environment Variables (Optional):
```bash
DATA_RETENTION_MONTHS=2      # Number of months to retain
DATA_CLEANUP_CRON=0 0 2 * * ? # Cleanup schedule
SALARY_PAYDAY=10              # Payday of the month
```

---

## 🧪 Testing

### Test Cleanup Logic:

1. **Set payday to tomorrow:**
   ```properties
   salary.payday=26  # If today is 25th
   ```

2. **Wait for day after tomorrow (27th) at 2 AM**
   - Or manually trigger via API

3. **Check logs:**
   ```bash
   tail -f logs/farmtime.log | grep "cleanup"
   ```

4. **Verify data:**
   - Check database for deleted records
   - Verify payment cycles are complete
   - Confirm 2-month retention

### Manual Trigger (for testing):

Add this endpoint to `DataCleanupController`:
```java
@PostMapping("/manual-cleanup")
public ResponseEntity<?> manualCleanup() {
    dataCleanupService.manualCleanup();
    return ResponseEntity.ok("Cleanup triggered");
}
```

---

## 📅 Retention Examples

### Scenario 1: Standard Month
```
Today: 11-May-2026
Payday: 10th
Retention: 2 months

Cutoff: 11-Mar-2026

Data Kept:
- 11-Mar-2026 to 11-May-2026 (2 months)

Data Deleted:
- Everything before 11-Mar-2026
```

### Scenario 2: Month-End Payday
```
Payday: 31st
Today: 1-Apr-2026 (one day after 31-Mar)
Retention: 2 months

Cutoff: 1-Feb-2026

Data Kept:
- 1-Feb-2026 to 1-Apr-2026 (2 months)

Data Deleted:
- Everything before 1-Feb-2026
```

### Scenario 3: February Edge Case
```
Payday: 31st
February has 28 days
Effective payday: 28-Feb
Cleanup runs: 1-Mar at 2:00 AM
Retention: 2 months

Cutoff: 1-Jan

Data Kept:
- 1-Jan onwards (2 months)

Data Deleted:
- Everything before 1-Jan
```

---

## ⚠️ Important Notes

### 1. **Cleanup Frequency**
- Runs **once per month** (one day after payday)
- Not daily, even though cron runs daily
- Day check ensures it only executes on correct day

### 2. **Data Safety**
- Payment cycles ALWAYS complete
- No partial cycle deletion
- Attendance and time-off: simple date-based

### 3. **Timing**
- Runs at 2:00 AM (low traffic time)
- One day after payday (safe buffer)
- Automatic, no manual intervention needed

### 4. **Retention Period**
- Default: 2 months
- Configurable via properties
- Counted from cleanup date

### 5. **Edge Cases Handled**
- Month-end paydays (31st in Feb)
- Leap years
- Different month lengths
- Cycle boundaries

---

## 🚨 Troubleshooting

### Cleanup Not Running?

**Check 1: Is today one day after payday?**
```
Payday: 10th
Today must be: 11th
```

**Check 2: Is cron schedule correct?**
```properties
data.cleanup.cron=0 0 2 * * ?
```

**Check 3: Check logs:**
```bash
grep "cleanup" logs/farmtime.log
```

### Too Much Data Deleted?

**Check retention period:**
```properties
data.retention.months=2  # Should be 2
```

### Payment Data Corrupted?

**This should NEVER happen due to cycle protection**

If it does:
1. Check logs for cycle-aware deletion
2. Verify safe cutoff date was used
3. Check if cycle logic is working

---

## 📊 Monitoring

### What to Monitor:

1. **Cleanup Execution:**
   ```bash
   grep "Data cleanup completed successfully" logs/farmtime.log
   ```

2. **Records Deleted:**
   ```bash
   grep "Deleted.*records older than" logs/farmtime.log
   ```

3. **Cycle Protection:**
   ```bash
   grep "cycle-safe date" logs/farmtime.log
   ```

4. **Skipped Days:**
   ```bash
   grep "Skipping data cleanup" logs/farmtime.log
   ```

### Expected Pattern (Monthly):
```
10th: Skipped (payday)
11th: EXECUTED ✓
12th: Skipped
13th: Skipped
...
10th next month: Skipped (payday)
11th next month: EXECUTED ✓
```

---

## ✅ Summary

**Schedule:** One day after payday at 2:00 AM
**Frequency:** Once per month
**Retention:** 2 months
**Safety:** Cycle-aware payment deletion
**Automatic:** No manual intervention needed

**Result:**
- Clean database
- Accurate reports
- No data corruption
- Predictable cleanup schedule
