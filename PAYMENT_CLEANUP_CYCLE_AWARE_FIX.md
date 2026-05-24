# Payment Data Cleanup - Cycle-Aware Fix

## 🚨 Critical Issue Fixed

**Problem:** The data cleanup scheduler was deleting payment records by simple date cutoff, which could **corrupt salary cycle data** and generate **wrong reports**.

### Example of the Problem:
```
Today: 24-May-2026
Retention: 2 months
Simple Cutoff: 24-Mar-2026

Salary Cycle: 11-Mar-2026 to 10-Apr-2026
- Employee Salary: ₹10,000
- Advance paid on 15-Mar: ₹1,000
- Salary paid on 10-Apr: ₹9,000

❌ OLD LOGIC: Would delete the advance (15-Mar < 24-Mar)
Result: Report shows only ₹9,000 paid, remaining ₹1,000
But actually ₹10,000 was paid! WRONG DATA!
```

## ✅ Solution: Cycle-Aware Payment Cleanup

Payment cleanup now **respects salary cycle boundaries** and only deletes **COMPLETE cycles**.

### How It Works:

1. **Check if today is payday** - If yes, SKIP payment cleanup entirely
2. **Calculate simple cutoff date** (e.g., 2 months ago)
3. **Find which salary cycle** that date falls into
4. **Only delete payments from cycles that COMPLETELY ended** before the cutoff
5. **Never delete partial cycles**

### 🚨 Critical Safety Rules:

1. **NO payment cleanup on payday** - Prevents interference with salary processing
2. **Only complete cycles deleted** - No partial cycle deletion
3. **Cycle-aware cutoff** - Respects salary cycle boundaries

## 🔧 Changes Made

### File: `DataCleanupService.java`

#### **New Logic:**

1. **Attendance & Time Off**: Simple date-based cleanup (no cycle dependency)
2. **Payments**: Cycle-aware cleanup using `calculateSafeCycleEndDateForCleanup()`

#### **Key Methods:**

1. **`isPayday()`**
   - Checks if today is payday
   - Returns true if current day matches configured payday
   - Handles month-end edge cases (e.g., payday=31 in February)

2. **`calculateSafeCycleEndDateForCleanup()`**
   - Takes simple cutoff date
   - Returns safe cutoff date that respects cycle boundaries
   - Returns null if no complete cycles are old enough

3. **`calculateCycleDatesForDate()`**
   - Determines which salary cycle a date belongs to
   - Uses same logic as SalaryCycleService and ExcelExportService

## 📊 Examples

### Example 1: Safe Deletion
```
Today: 24-May-2026
Retention: 2 months
Simple Cutoff: 24-Mar-2026
Payday: 10th

Step 1: Find which cycle 24-Mar falls into
- Cycle: 11-Mar to 10-Apr

Step 2: Is 24-Mar before cycle end (10-Apr)?
- Yes! So we need to go back one more cycle

Step 3: Find previous complete cycle
- Previous cycle ended: 10-Mar (day before 11-Mar)

Step 4: Safe cutoff = 10-Mar
- Delete all payments with date <= 10-Mar
- This deletes ONLY complete cycles that ended on or before 10-Mar

Result:
✓ Cycle ending 10-Feb: DELETED (complete)
✓ Cycle ending 10-Mar: DELETED (complete)
✗ Cycle 11-Mar to 10-Apr: KEPT (partial - contains dates after cutoff)
✗ Current cycles: KEPT
```

### Example 2: Cutoff Falls on Cycle End
```
Today: 24-May-2026
Retention: 2 months
Simple Cutoff: 10-Apr-2026
Payday: 10th

Step 1: Find which cycle 10-Apr falls into
- Cycle: 11-Mar to 10-Apr

Step 2: Is 10-Apr before cycle end (10-Apr)?
- No! It's exactly on the cycle end

Step 3: Safe cutoff = 10-Apr
- Delete all payments with date <= 10-Apr

Result:
✓ Cycle ending 10-Feb: DELETED (complete)
✓ Cycle ending 10-Mar: DELETED (complete)
✓ Cycle ending 10-Apr: DELETED (complete - ended on cutoff date)
✗ Cycle 11-Apr to 10-May: KEPT
✗ Current cycles: KEPT
```

### Example 3: No Complete Cycles Old Enough
```
Today: 15-May-2026
Retention: 15 minutes (testing mode)
Simple Cutoff: 15-May-2026 (same day)
Payday: 10th

Step 1: Find which cycle 15-May falls into
- Cycle: 11-May to 10-Jun

Step 2: Is 15-May before cycle end (10-Jun)?
- Yes! So we need previous cycle end

Step 3: Previous cycle ended: 10-May

Step 4: Is 10-May in the past?
- Yes, but it's only 5 days ago

Step 5: Safe cutoff = 10-May
- Delete all payments with date <= 10-May

Result:
✓ All cycles ending on or before 10-May: DELETED
✗ Current cycle (11-May to 10-Jun): KEPT
```

### Example 4: Payday Safety Check
```
Today: 10-May-2026 (PAYDAY!)
Retention: 2 months
Simple Cutoff: 10-Mar-2026
Payday: 10th

Step 1: Check if today is payday
- Today is 10th
- Configured payday is 10th
- Today IS PAYDAY!

Step 2: SKIP payment cleanup
- Log warning: "SKIPPING payment cleanup - Today is PAYDAY"
- No payment data deleted

Step 3: Other cleanups proceed
- Attendance: DELETED (older than cutoff)
- Time Off: DELETED (older than cutoff)
- Payments: SKIPPED (payday protection)

Result:
✗ Payment cleanup: SKIPPED (today is payday)
✓ Attendance cleanup: COMPLETED
✓ Time Off cleanup: COMPLETED

Why?
- Payday is when salary processing happens
- Deleting payment data during salary processing could cause issues
- Better to skip one day than risk data corruption
- Cleanup will run tomorrow (11-May) when it's safe
```

## 🎯 Benefits

### 1. **Data Integrity**
- No partial cycle deletion
- All payments in a cycle stay together
- Reports always show accurate data

### 2. **Correct Calculations**
- Net Payable = Salary + Bonus - Deduction (all components present)
- Remaining Amount = Accurate (no missing payments)
- Cycle summaries = Complete

### 3. **Payday Protection**
- No payment cleanup on payday
- Prevents interference with salary processing
- Cleanup deferred to next day automatically

### 4. **Audit Trail**
- Complete cycles preserved for reporting
- No data corruption
- Historical accuracy maintained

## 📝 Real-World Scenario

### Scenario: Monthly Cleanup with 2-Month Retention

```
Company: FarmTime Farms
Payday: 10th of every month
Retention Policy: 2 months
Cleanup Schedule: Daily at 7:00 AM

Timeline:
┌─────────────────────────────────────────────────┐
│ 11-Jan to 10-Feb: Cycle 1 (COMPLETE)          │
│ 11-Feb to 10-Mar: Cycle 2 (COMPLETE)          │
│ 11-Mar to 10-Apr: Cycle 3 (COMPLETE)          │
│ 11-Apr to 10-May: Cycle 4 (COMPLETE)          │
│ 11-May to 10-Jun: Cycle 5 (CURRENT)           │
└─────────────────────────────────────────────────┘

Cleanup runs on: 24-May-2026
Simple cutoff: 24-Mar-2026
Cycle cutoff falls in: 11-Mar to 10-Apr

Safe cutoff calculation:
- 24-Mar is DURING cycle 3 (11-Mar to 10-Apr)
- Can't delete partial cycle 3
- Go back to previous complete cycle
- Safe cutoff = 10-Mar (end of cycle 2)

Deletion:
✓ Cycle 1 (ended 10-Feb): DELETED
✓ Cycle 2 (ended 10-Mar): DELETED
✗ Cycle 3 (ended 10-Apr): KEPT (contains dates after 24-Mar)
✗ Cycle 4 (ended 10-May): KEPT
✗ Cycle 5 (current): KEPT

Employee: Rajesh Kumar
Cycle 3 (11-Mar to 10-Apr):
- Advance on 15-Mar: ₹1,000 ← KEPT (not deleted)
- Salary on 10-Apr: ₹9,000 ← KEPT (not deleted)
Total: ₹10,000 ← CORRECT!

If old logic was used:
- Advance on 15-Mar: ₹1,000 ← DELETED (15-Mar > 24-Mar)
- Salary on 10-Apr: ₹9,000 ← KEPT
Total: ₹9,000 ← WRONG! Missing ₹1,000
```

## 🧪 Testing

### Test Case 1: Verify Cycle Boundary Respect
```
Setup:
- Create payments across multiple cycles
- Set retention to delete some cycles
- Run cleanup

Verify:
- Only COMPLETE cycles are deleted
- No partial cycle deletion
- All payments in kept cycles are intact
```

### Test Case 2: Verify Report Accuracy
```
Setup:
- Create cycle with multiple payment types
- Run cleanup that should keep this cycle
- Generate payment report

Verify:
- All payment types present (SALARY, ADVANCE, BONUS, DEDUCTION)
- Net Payable calculation correct
- Remaining amount accurate
```

### Test Case 3: Edge Case - Cutoff on Cycle End
```
Setup:
- Set cutoff date exactly on a cycle end date (e.g., 10-Apr)
- Run cleanup

Verify:
- Cycle ending on cutoff date is DELETED (complete)
- Next cycle is KEPT
```

## ⚠️ Important Notes

### 1. **Payday Protection**
- Payment cleanup NEVER runs on payday
- Prevents interference with salary processing
- If cleanup scheduled on payday, it's automatically skipped
- Cleanup will run next day when safe

### 2. **Attendance & Time Off**
- Still use simple date-based cleanup
- No cycle dependency for these records
- Safe to delete by date
- Run even on payday (no conflict)

### 3. **Payment Records**
- ALWAYS use cycle-aware cleanup
- Critical for report accuracy
- Never delete partial cycles
- Never delete on payday

### 4. **Logging**
- Detailed logs show:
  - Simple cutoff date
  - Cycle boundaries
  - Safe cutoff date
  - Reason for cutoff adjustment
  - Payday skip warnings

### 5. **Safety Checks**
- Returns null if no safe cutoff found
- Prevents deletion if uncertain
- Logs when no cleanup performed
- Payday check before any payment deletion

## 🚀 Deployment

**Restart the backend application** for changes to take effect.

After restart:
- Payment cleanup will respect salary cycles
- No risk of partial cycle deletion
- Reports will always show accurate data

## 📌 Configuration

Relevant settings in `application-aws.properties`:

```properties
# Salary cycle configuration
salary.payday=10

# Data retention (for testing: minutes, for production: months/days)
data.retention.minutes=15
data.retention.days=2
data.retention.months=2

# Cleanup schedule
data.cleanup.cron=0 */15 * * * ?
```

## 🔍 Monitoring

### Normal Day (Not Payday):
```
Starting scheduled data cleanup (retention period: 2 months)...
Deleted attendance records older than 2026-03-24
Payment cleanup: Simple cutoff=2026-03-24, Current cycle=2026-03-11 to 2026-04-10, Safe cutoff=2026-03-10 (previous cycle end)
Deleted payment records older than 2026-03-10 (cycle-safe date)
Deleted time off records older than 2026-03-24
Data cleanup completed successfully
```

This confirms:
- Simple cutoff was adjusted
- Cycle boundaries were respected
- Only complete cycles were deleted

### On Payday:
```
Starting scheduled data cleanup (retention period: 2 months)...
Deleted attendance records older than 2026-03-24
SKIPPING payment cleanup - Today is PAYDAY (2026-05-10). Payment data will not be deleted on payday for safety.
Deleted time off records older than 2026-03-24
Data cleanup completed successfully
```

This confirms:
- Payday was detected
- Payment cleanup was skipped
- Other cleanups proceeded normally
- System is protecting payment data on payday
