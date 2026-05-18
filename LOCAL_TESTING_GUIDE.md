# Local Testing Guide - FarmTime Backend

Complete guide to run and test the FarmTime backend locally with PostgreSQL database.

---

## Prerequisites

- ✅ PostgreSQL installed and running
- ✅ Java 17 installed
- ✅ Maven installed

---

## Step 1: Setup Local PostgreSQL Database

### Start PostgreSQL Service

```bash
# macOS (using Homebrew)
brew services start postgresql@14

# Or check if already running
brew services list | grep postgresql
```

### Create Database and User

```bash
# Connect to PostgreSQL
psql postgres

# Inside psql, run these commands:
CREATE DATABASE farmtime_db;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE farmtime_db TO postgres;

# Exit psql
\q
```

### Verify Database Connection

```bash
psql -h localhost -U postgres -d farmtime_db
# Enter password: postgres

# If successful, you'll see:
# farmtime_db=#

# Exit
\q
```

---

## Step 2: Run Backend Application

### Navigate to Backend Directory

```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/backend
```

### Run Using Script (Recommended)

```bash
chmod +x run.sh
./run.sh
```

### Or Run Using Maven Directly

```bash
mvn spring-boot:run
```

### Verify Backend is Running

```bash
# Check health endpoint
curl http://localhost:8080/api/health

# Expected response:
# {"status":"UP"}
```

---

## Step 3: Login and Get JWT Token

### 1. Register an Admin User (First Time Only)

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "email": "admin@farmtime.com"
  }'
```

### 2. Login to Get JWT Token

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTcxNjA...",
  "username": "admin",
  "role": "ADMIN"
}
```

**Save the token** - You'll need it for all subsequent requests!

---

## Step 4: Create Test Data

### Set Your Token as Environment Variable

```bash
# Replace with your actual token from login response
export TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTcxNjA..."
```

### Create Test Employees

```bash
# Employee 1
curl -X POST http://localhost:8080/api/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "John Doe",
    "monthlySalary": 30000,
    "phoneNumber": "9876543210",
    "address": "Mumbai, India",
    "isActive": true
  }'

# Employee 2
curl -X POST http://localhost:8080/api/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Jane Smith",
    "monthlySalary": 28000,
    "phoneNumber": "9876543211",
    "address": "Delhi, India",
    "isActive": true
  }'

# Employee 3
curl -X POST http://localhost:8080/api/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Bob Johnson",
    "monthlySalary": 32000,
    "phoneNumber": "9876543212",
    "address": "Bangalore, India",
    "isActive": true
  }'
```

### Get Employee IDs

```bash
curl -X GET http://localhost:8080/api/employees \
  -H "Authorization: Bearer $TOKEN"
```

**Note the employee IDs** (e.g., 1, 2, 3) - you'll need them for testing reports!

### Create Test Attendance Records

```bash
# Attendance for Employee 1
curl -X POST http://localhost:8080/api/attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "employeeId": 1,
    "attendanceDate": "2026-05-15",
    "checkInTime": "09:00",
    "checkOutTime": "18:00",
    "isPresent": true,
    "notes": "Regular day"
  }'

# Attendance for Employee 2
curl -X POST http://localhost:8080/api/attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "employeeId": 2,
    "attendanceDate": "2026-05-15",
    "checkInTime": "09:30",
    "checkOutTime": "17:30",
    "isPresent": true,
    "notes": "Late arrival"
  }'

# Attendance for Employee 3
curl -X POST http://localhost:8080/api/attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "employeeId": 3,
    "attendanceDate": "2026-05-15",
    "checkInTime": "08:45",
    "checkOutTime": "18:15",
    "isPresent": true,
    "notes": "Early arrival"
  }'
```

### Create Test Payment Records

```bash
# Payment for Employee 1
curl -X POST http://localhost:8080/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "employeeId": 1,
    "amount": 15000,
    "paymentDate": "2026-05-10",
    "paymentType": "SALARY",
    "description": "Half month salary"
  }'

# Payment for Employee 2
curl -X POST http://localhost:8080/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "employeeId": 2,
    "amount": 28000,
    "paymentDate": "2026-05-10",
    "paymentType": "SALARY",
    "description": "Full month salary"
  }'

# Payment for Employee 3
curl -X POST http://localhost:8080/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "employeeId": 3,
    "amount": 10000,
    "paymentDate": "2026-05-10",
    "paymentType": "ADVANCE",
    "description": "Advance payment"
  }'
```

---

## Step 5: Test Report APIs

### Test 1: Attendance Report - Single Employee

```bash
curl -X GET "http://localhost:8080/api/reports/attendance/export?employeeIds=1&startDate=2026-05-01&endDate=2026-05-19" \
  -H "Authorization: Bearer $TOKEN" \
  -o attendance_report_employee1.xlsx

# Check if file was created
ls -lh attendance_report_employee1.xlsx
```

### Test 2: Attendance Report - Multiple Employees

```bash
curl -X GET "http://localhost:8080/api/reports/attendance/export?employeeIds=1&employeeIds=2&employeeIds=3&startDate=2026-05-01&endDate=2026-05-19" \
  -H "Authorization: Bearer $TOKEN" \
  -o attendance_report_all.xlsx

# Check if file was created
ls -lh attendance_report_all.xlsx
```

### Test 3: Payment Report - Single Employee

```bash
curl -X GET "http://localhost:8080/api/reports/payments/export?employeeIds=1&startDate=2026-05-01&endDate=2026-05-19" \
  -H "Authorization: Bearer $TOKEN" \
  -o payment_report_employee1.xlsx

# Check if file was created
ls -lh payment_report_employee1.xlsx
```

### Test 4: Payment Report - Multiple Employees (With Summary Grid)

```bash
curl -X GET "http://localhost:8080/api/reports/payments/export?employeeIds=1&employeeIds=2&employeeIds=3&startDate=2026-05-01&endDate=2026-05-19" \
  -H "Authorization: Bearer $TOKEN" \
  -o payment_report_all.xlsx

# Check if file was created
ls -lh payment_report_all.xlsx
```

### Test 5: Payment Report - Two Employees Only

```bash
curl -X GET "http://localhost:8080/api/reports/payments/export?employeeIds=1&employeeIds=2&startDate=2026-05-01&endDate=2026-05-19" \
  -H "Authorization: Bearer $TOKEN" \
  -o payment_report_two_employees.xlsx

# Check if file was created
ls -lh payment_report_two_employees.xlsx
```

---

## Step 6: Verify Report Contents

### Open Excel Files

```bash
# macOS - Open with default application
open attendance_report_employee1.xlsx
open payment_report_all.xlsx
```

### What to Check in Payment Report

1. **Main Table:**
   - ✅ No "Remaining" column
   - ✅ Columns: No., Employee Name, Monthly Salary, Date, Amount, Payment Type, Description
   - ✅ Only selected employees appear

2. **Employee-wise Summary Section (at bottom):**
   - ✅ Section title: "Employee-wise Payment Summary"
   - ✅ Columns: Employee Name, Monthly Salary, Total Paid, Remaining
   - ✅ Remaining amount calculated correctly (Monthly Salary - Total Paid)
   - ✅ Color coding:
     - Red & Bold if overpaid (negative remaining)
     - Green & Bold if underpaid (positive remaining)

### What to Check in Attendance Report

1. ✅ Only selected employees appear
2. ✅ Correct date range
3. ✅ All attendance records for selected employees

---

## Troubleshooting

### Issue: Database Connection Failed

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL if not running
brew services start postgresql@14

# Test connection
psql -h localhost -U postgres -d farmtime_db
```

### Issue: Port 8080 Already in Use

```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or change port in application.properties
# server.port=8081
```

### Issue: JWT Token Expired

```bash
# Login again to get new token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Update TOKEN environment variable
export TOKEN="<new-token>"
```

### Issue: No Data in Reports

```bash
# Verify employees exist
curl -X GET http://localhost:8080/api/employees \
  -H "Authorization: Bearer $TOKEN"

# Verify attendance records exist
curl -X GET "http://localhost:8080/api/attendance?startDate=2026-05-01&endDate=2026-05-19" \
  -H "Authorization: Bearer $TOKEN"

# Verify payment records exist
curl -X GET "http://localhost:8080/api/payments?startDate=2026-05-01&endDate=2026-05-19" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Quick Test Script

Save this as `test_reports.sh`:

```bash
#!/bin/bash

# Set your token here
TOKEN="YOUR_TOKEN_HERE"

# Test single employee attendance report
echo "Testing single employee attendance report..."
curl -X GET "http://localhost:8080/api/reports/attendance/export?employeeIds=1&startDate=2026-05-01&endDate=2026-05-19" \
  -H "Authorization: Bearer $TOKEN" \
  -o attendance_single.xlsx
echo "✓ Saved to attendance_single.xlsx"

# Test multiple employees payment report
echo "Testing multiple employees payment report..."
curl -X GET "http://localhost:8080/api/reports/payments/export?employeeIds=1&employeeIds=2&employeeIds=3&startDate=2026-05-01&endDate=2026-05-19" \
  -H "Authorization: Bearer $TOKEN" \
  -o payment_multiple.xlsx
echo "✓ Saved to payment_multiple.xlsx"

# Open files
open attendance_single.xlsx
open payment_multiple.xlsx

echo "✓ All tests complete!"
```

Run it:
```bash
chmod +x test_reports.sh
./test_reports.sh
```

---

## Summary

1. **Start PostgreSQL:** `brew services start postgresql@14`
2. **Create Database:** `psql postgres` → `CREATE DATABASE farmtime_db;`
3. **Run Backend:** `cd backend && ./run.sh`
4. **Login:** Get JWT token
5. **Create Test Data:** Employees, Attendance, Payments
6. **Test Reports:** Use curl commands above
7. **Verify:** Open Excel files and check format

---

**Ready to test! 🚀**
