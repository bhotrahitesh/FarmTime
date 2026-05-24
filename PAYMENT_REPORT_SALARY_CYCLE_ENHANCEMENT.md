# Payment Report Enhancement - Salary Cycle Grouping

## ✅ Problem Solved

**Issue:** The previous payment report didn't properly handle multi-month data. When downloading reports spanning multiple months, payments from different salary cycles were mixed together, making it confusing to track which payments belonged to which cycle.

**Solution:** Enhanced the payment report to automatically group payments by salary cycles, with separate sections for each cycle showing detailed breakdowns.

## 🔧 Changes Made

### File: `ExcelExportService.java`

#### **New Features:**

1. **Salary Cycle Grouping**
   - Payments are now automatically grouped by their salary cycle
   - Each cycle gets its own section in the report
   - Cycles are sorted chronologically

2. **Enhanced Summary Per Cycle**
   - Monthly Salary
   - Salary Paid (SALARY type payments)
   - Advance (ADVANCE type payments)
   - Bonus (BONUS type payments)
   - Deduction (DEDUCTION type payments)
   - Net Payable = Monthly Salary + Bonus - Deduction
   - Remaining = Net Payable - (Salary Paid + Advance + Bonus - Deduction)

3. **Visual Improvements**
   - Cycle headers with distinct blue background
   - Color-coded remaining amounts (green for positive, red for negative)
   - Clear separation between cycles
   - Continuous serial numbers across all cycles

## 📊 Report Structure

### For Single Month:
```
Payment Report - Grouped by Salary Cycles
Period: 01-04-2026 to 30-04-2026

Note: This period may span 2 salary cycles!

┌─────────────────────────────────────────────────┐
│ Salary Cycle: 11-03-2026 to 10-04-2026        │
├─────────────────────────────────────────────────┤
│ No. │ Employee │ Salary │ Date │ Amount │ Type │
├─────────────────────────────────────────────────┤
│  1  │ John     │ 30,000 │ 05-Apr │ 10,000 │ ADVANCE │
│  2  │ Jane     │ 25,000 │ 10-Apr │ 25,000 │ SALARY  │
├─────────────────────────────────────────────────┤
│ Cycle Total: ₹35,000                           │
├─────────────────────────────────────────────────┤
│ Employee Summary for this Cycle                │
├─────────────────────────────────────────────────┤
│ Employee │ Salary │ Paid │ Adv │ Bonus │ Ded │ Net │ Remaining │
│ John     │ 30,000 │ 0    │ 10K │ 0     │ 0   │ 30K │ 20,000    │
│ Jane     │ 25,000 │ 25K  │ 0   │ 0     │ 0   │ 25K │ 0         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Salary Cycle: 11-04-2026 to 10-05-2026        │
├─────────────────────────────────────────────────┤
│ No. │ Employee │ Salary │ Date │ Amount │ Type │
├─────────────────────────────────────────────────┤
│  3  │ John     │ 30,000 │ 15-Apr │ 5,000  │ ADVANCE │
│  4  │ John     │ 30,000 │ 20-Apr │ 2,000  │ BONUS   │
│  5  │ Jane     │ 25,000 │ 25-Apr │ 3,000  │ ADVANCE │
├─────────────────────────────────────────────────┤
│ Cycle Total: ₹10,000                           │
├─────────────────────────────────────────────────┤
│ Employee Summary for this Cycle                │
├─────────────────────────────────────────────────┤
│ Employee │ Salary │ Paid │ Adv │ Bonus │ Ded │ Net │ Remaining │
│ John     │ 30,000 │ 0    │ 5K  │ 2K    │ 0   │ 32K │ 25,000    │
│ Jane     │ 25,000 │ 0    │ 3K  │ 0     │ 0   │ 25K │ 22,000    │
└─────────────────────────────────────────────────┘
```

### For Multiple Months:
```
Payment Report - Grouped by Salary Cycles
Period: 01-03-2026 to 30-05-2026

┌─────────────────────────────────────────────────┐
│ Salary Cycle: 11-03-2026 to 10-04-2026        │
├─────────────────────────────────────────────────┤
│ [Payments for March cycle]                     │
│ [Employee Summary for March cycle]             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Salary Cycle: 11-04-2026 to 10-05-2026        │
├─────────────────────────────────────────────────┤
│ [Payments for April cycle]                     │
│ [Employee Summary for April cycle]             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Salary Cycle: 11-05-2026 to 10-06-2026        │
├─────────────────────────────────────────────────┤
│ [Payments for May cycle]                       │
│ [Employee Summary for May cycle]               │
└─────────────────────────────────────────────────┘
```

## 🎯 Key Benefits

1. **No Overlap Between Cycles**
   - Each payment is assigned to exactly one salary cycle
   - Payments from one month don't mix with another

2. **Clear Cycle Boundaries**
   - Salary cycle: 10th of current month to 9th of next month
   - Clearly labeled in each section header

3. **Accurate Calculations**
   - Net Payable considers bonuses and deductions
   - Remaining amount shows what's still owed for that specific cycle
   - Each cycle is independent

4. **Multi-Month Support**
   - Download reports for 3 months, 6 months, or any range
   - Each cycle appears as a separate section
   - Easy to see payment history across multiple cycles

5. **Payment Type Breakdown**
   - See exactly how much was paid as salary vs advance
   - Track bonuses separately
   - Monitor deductions per cycle

## 📝 Example Scenarios

### Scenario 1: Single Employee, 2 Months
```
Employee: Rajesh Kumar
Monthly Salary: ₹30,000

Cycle 1 (11-Mar to 10-Apr):
- Advance on 15-Mar: ₹5,000
- Salary on 10-Apr: ₹25,000
- Net Payable: ₹30,000
- Remaining: ₹0

Cycle 2 (11-Apr to 10-May):
- Advance on 20-Apr: ₹3,000
- Salary on 10-May: ₹27,000
- Net Payable: ₹30,000
- Remaining: ₹0
```

### Scenario 2: With Bonus and Deduction
```
Employee: Priya Sharma
Monthly Salary: ₹25,000

Cycle (11-Apr to 10-May):
- Salary on 10-May: ₹20,000
- Bonus on 15-Apr: ₹2,000
- Deduction on 20-Apr: ₹1,500 (Equipment damage)
- Net Payable: ₹25,000 + ₹2,000 - ₹1,500 = ₹25,500
- Total Paid: ₹20,000 + ₹2,000 - ₹1,500 = ₹20,500
- Remaining: ₹5,000
```

## 🔄 Salary Cycle Logic

The system uses the configured `salary.payday` (default: 10) to determine cycles:

**Payday is the END of the cycle. The next day starts a new cycle.**

- **If payday = 10:**
  - Cycle 1: 11-Jan to 10-Feb
  - Cycle 2: 11-Feb to 10-Mar
  - Cycle 3: 11-Mar to 10-Apr
  - Cycle 4: 11-Apr to 10-May
  - And so on...

- **Payment Assignment:**
  - Payment on 15-Jan → Assigned to Cycle 1 (11-Jan to 10-Feb)
  - Payment on 10-Feb → Assigned to Cycle 1 (11-Jan to 10-Feb) - Payday itself
  - Payment on 11-Feb → Assigned to Cycle 2 (11-Feb to 10-Mar) - New cycle starts
  - Payment on 05-Mar → Assigned to Cycle 2 (11-Feb to 10-Mar)
  - Payment on 12-Apr → Assigned to Cycle 4 (11-Apr to 10-May)

## ✅ Testing Checklist

- [ ] Download single-month report - verify single cycle appears
- [ ] Download 2-month report - verify 2 cycles appear separately
- [ ] Download 3-month report - verify 3 cycles with no overlap
- [ ] Verify payments are in correct cycles based on date
- [ ] Check Net Payable calculation includes bonus and deduction
- [ ] Verify Remaining amount is correct per cycle
- [ ] Check color coding (green/red) for remaining amounts
- [ ] Verify serial numbers continue across cycles
- [ ] Test with employees having different payment types

## 🚀 Deployment

**Restart the backend application** for changes to take effect.

After restart:
- All new payment report downloads will use the new format
- Multi-month reports will be properly grouped by salary cycles
- No database changes required

## 📌 Configuration

The salary cycle is controlled by:
```properties
salary.payday=10
```

Located in `application-aws.properties`. Change this value to adjust when salary cycles start/end.
