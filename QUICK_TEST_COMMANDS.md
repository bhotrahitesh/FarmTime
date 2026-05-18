# Quick Test Commands - Report API Testing

## 1. Start Local Environment

```bash
# Start PostgreSQL
brew services start postgresql@14

# Run Backend
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/backend
./run.sh
```

## 2. Get JWT Token

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Set token (replace with actual token from response)
export TOKEN="eyJhbGciOiJIUzI1NiJ9..."
```

## 3. Test Report APIs

### Single Employee - Attendance Report
```bash
curl -X GET "http://localhost:8080/api/reports/attendance/export?employeeIds=1&startDate=2026-05-01&endDate=2026-05-19" \
  -H "Authorization: Bearer $TOKEN" \
  -o test_attendance_single.xlsx && open test_attendance_single.xlsx
```

### Multiple Employees - Attendance Report
```bash
curl -X GET "http://localhost:8080/api/reports/attendance/export?employeeIds=1&employeeIds=2&employeeIds=3&startDate=2026-05-01&endDate=2026-05-19" \
  -H "Authorization: Bearer $TOKEN" \
  -o test_attendance_multiple.xlsx && open test_attendance_multiple.xlsx
```

### Single Employee - Payment Report
```bash
curl -X GET "http://localhost:8080/api/reports/payments/export?employeeIds=1&startDate=2026-05-01&endDate=2026-05-19" \
  -H "Authorization: Bearer $TOKEN" \
  -o test_payment_single.xlsx && open test_payment_single.xlsx
```

### Multiple Employees - Payment Report (Check Summary Grid!)
```bash
curl -X GET "http://localhost:8080/api/reports/payments/export?employeeIds=1&employeeIds=2&employeeIds=3&startDate=2026-05-01&endDate=2026-05-19" \
  -H "Authorization: Bearer $TOKEN" \
  -o test_payment_multiple.xlsx && open test_payment_multiple.xlsx
```

## 4. Verify Payment Report

**Check for:**
- ✅ No "Remaining" column in main table
- ✅ Employee-wise summary section at bottom
- ✅ Summary shows: Employee Name, Monthly Salary, Total Paid, Remaining
- ✅ Only selected employees in report

## 5. Quick Data Setup (If Needed)

```bash
# Get all employees
curl -X GET http://localhost:8080/api/employees -H "Authorization: Bearer $TOKEN"

# Create test employee
curl -X POST http://localhost:8080/api/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Test User", "monthlySalary": 30000, "phoneNumber": "9999999999", "isActive": true}'

# Create test payment
curl -X POST http://localhost:8080/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"employeeId": 1, "amount": 15000, "paymentDate": "2026-05-15", "paymentType": "SALARY"}'
```
