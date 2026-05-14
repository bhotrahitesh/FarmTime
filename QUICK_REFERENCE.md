# FarmTime - Quick Reference Guide

## 🚀 Recent Updates (2026-05-14)

### 1. ✅ Date Picker Fix
**Problem**: App freezing when selecting dates
**Solution**: Replaced incompatible date picker with Expo-compatible version
**Status**: Fixed and tested

### 2. ✅ Excel Reports Feature
**Feature**: Download attendance and payment reports in Excel format
**Access**: Reports tab in mobile app
**Filters**: Date range, employee selection (all/single/multiple)

### 3. ✅ Automatic Data Cleanup
**Feature**: Auto-delete records older than 2 months
**Schedule**: Daily at 2 AM
**Scope**: Attendance, Payments, Time-off (Employee records never deleted)

### 4. ✅ Attendance Search & Filter
**Feature**: Search by employee name and filter by month
**Date Format**: Standardized to dd-MMM-yyyy (e.g., 14-May-2026)
**Access**: Attendance tab → Search bar and month selector

---

## 📱 Mobile App Features

### Navigation Tabs
1. **Home** - Dashboard overview
2. **Employees** - Manage employees
3. **Attendance** - Mark and view attendance
4. **Payments** - Record and track payments
5. **Time Off** - Manage leave requests
6. **Reports** - Download Excel reports (NEW)

### Reports Screen
**Location**: Reports tab → Bottom navigation

**Features**:
- Select date range (start & end dates)
- Select employees (all/single/multiple)
- Download Attendance Report (Excel)
- Download Payment Report (Excel)
- Share downloaded files

**Usage**:
1. Tap "Reports" tab
2. Select date range
3. Select employees (optional - leave empty for all)
4. Tap download button
5. Share or save the Excel file

### Attendance Screen (Enhanced)
**Location**: Attendance tab → Bottom navigation

**Features**:
- Search by employee name (real-time filtering)
- Filter by month (dropdown selector)
- View attendance records in dd-MMM-yyyy format
- Pull to refresh
- Add new attendance (FAB button)

**Usage**:
1. Tap "Attendance" tab
2. Type employee name in search bar to filter
3. Tap month button to select different month
4. View filtered results
5. Tap + button to mark new attendance

---

## 🔧 Backend API Endpoints

### Reports
```http
GET /api/reports/attendance/export?employeeIds=1,2&startDate=2024-01-01&endDate=2024-01-31
GET /api/reports/payments/export?employeeIds=1,2&startDate=2024-01-01&endDate=2024-01-31
```

### Admin (Data Cleanup)
```http
GET /api/admin/cleanup/config
POST /api/admin/cleanup
```

### Employees
```http
GET /api/employees
GET /api/employees/active
GET /api/employees/{id}
POST /api/employees
PUT /api/employees/{id}
DELETE /api/employees/{id}
```

### Attendance
```http
GET /api/attendance?startDate=2024-01-01&endDate=2024-01-31
GET /api/attendance/employee/{id}?startDate=2024-01-01&endDate=2024-01-31
POST /api/attendance
PUT /api/attendance/{id}
DELETE /api/attendance/{id}
```

### Payments
```http
GET /api/payments?startDate=2024-01-01&endDate=2024-01-31
GET /api/payments/employee/{id}
POST /api/payments
PUT /api/payments/{id}
DELETE /api/payments/{id}
```

### Time Off
```http
GET /api/timeoff?startDate=2024-01-01&endDate=2024-01-31
GET /api/timeoff/employee/{id}
POST /api/timeoff
PUT /api/timeoff/{id}
DELETE /api/timeoff/{id}
```

---

## ⚙️ Configuration

### Backend (`application.properties`)

```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/farmtime_db
spring.datasource.username=postgres
spring.datasource.password=postgres

# Data Retention
data.retention.months=2
data.cleanup.cron=0 0 2 * * ?

# JWT
jwt.secret=your-secret-key
jwt.expiration=86400000
```

### Mobile (`package.json`)

**Key Dependencies**:
- `expo`: ~50.0.0
- `react-native`: 0.73.0
- `@react-native-community/datetimepicker`: 7.7.0
- `expo-file-system`: ~16.0.9
- `expo-sharing`: ~11.10.0
- `react-native-paper`: ^5.11.0

---

## 🛠️ Development Commands

### Backend

```bash
# Build
cd backend
mvn clean install -DskipTests

# Run
./run.sh
# or
java -jar target/farmtime-backend-1.0.0.jar

# Compile only
mvn clean compile
```

### Mobile

```bash
# Install dependencies
cd mobile
npm install

# Start Metro bundler
npx expo start

# Build and run Android
npx expo run:android

# Rebuild native code (after adding new Expo modules)
npx expo prebuild --clean
npx expo run:android

# Clean Android build
cd android
./gradlew clean
cd ..
```

---

## 📊 Data Retention Policy

### What Gets Deleted
- ❌ Attendance records older than 2 months
- ❌ Payment records older than 2 months
- ❌ Time-off records older than 2 months

### What's Protected
- ✅ Employee master data (always retained)
- ✅ User accounts (always retained)
- ✅ Recent data (last 2 months)

### Schedule
- **Automatic**: Daily at 2:00 AM
- **Manual**: `POST /api/admin/cleanup`

### Configuration
```properties
# Change retention period (months)
data.retention.months=3

# Change schedule (cron expression)
data.cleanup.cron=0 0 3 * * ?  # 3 AM daily
```

---

## 🐛 Troubleshooting

### Mobile App Issues

**Date picker not showing**:
```bash
npm install
npx expo prebuild --clean
npx expo run:android
```

**Build fails with "Build Tools corrupted"**:
- Check `/mobile/android/build.gradle`
- Ensure `buildToolsVersion = '33.0.0'`

**Metro bundler port conflict**:
```bash
npx expo start --clear
```

### Backend Issues

**Maven build fails**:
```bash
mvn clean install -U
```

**Database connection error**:
- Check PostgreSQL is running
- Verify credentials in `application.properties`

**Scheduled tasks not running**:
- Check `@EnableScheduling` in `FarmTimeApplication.java`
- Verify cron expression syntax

---

## 📁 Project Structure

```
FarmTime/
├── backend/
│   ├── src/main/java/com/farmtime/
│   │   ├── controller/
│   │   │   ├── AdminController.java (NEW)
│   │   │   ├── ReportController.java (NEW)
│   │   │   ├── AttendanceController.java
│   │   │   ├── EmployeeController.java
│   │   │   ├── PaymentController.java
│   │   │   └── TimeOffController.java
│   │   ├── service/
│   │   │   ├── DataCleanupService.java (UPDATED)
│   │   │   ├── ExcelExportService.java (NEW)
│   │   │   └── ...
│   │   ├── repository/
│   │   ├── model/
│   │   └── dto/
│   └── src/main/resources/
│       └── application.properties (UPDATED)
│
├── mobile/
│   ├── src/
│   │   ├── screens/
│   │   │   ├── ReportsScreen.js (NEW)
│   │   │   ├── AddEmployeeScreen.js (UPDATED)
│   │   │   ├── AddTimeOffScreen.js (UPDATED)
│   │   │   ├── MarkAttendanceScreen.js (UPDATED)
│   │   │   └── AddPaymentScreen.js (UPDATED)
│   │   ├── services/
│   │   │   └── api.js (UPDATED)
│   │   └── navigation/
│   │       └── MainNavigator.js (UPDATED)
│   ├── android/
│   │   └── build.gradle (UPDATED)
│   └── package.json (UPDATED)
│
└── Documentation/
    ├── DATEPICKER_FIX.md
    ├── EXCEL_REPORTS_FEATURE.md
    ├── DATA_RETENTION_FEATURE.md
    ├── IMPLEMENTATION_SUMMARY.md
    └── QUICK_REFERENCE.md (This file)
```

---

## 🔐 Security Notes

### API Security
- All endpoints require JWT authentication
- CORS configured for allowed origins
- Sensitive data in environment variables (production)

### Data Protection
- Employee records never auto-deleted
- 2-month retention for compliance
- Transaction safety for cleanup operations
- Comprehensive audit logging

---

## 📚 Documentation Files

1. **DATEPICKER_FIX.md** - Date picker issue resolution
2. **EXCEL_REPORTS_FEATURE.md** - Complete reports feature guide
3. **DATA_RETENTION_FEATURE.md** - Data cleanup documentation
4. **IMPLEMENTATION_SUMMARY.md** - Full implementation overview
5. **QUICK_REFERENCE.md** - This file

---

## 🎯 Testing Checklist

### Date Picker
- [ ] Add Employee - Joining date
- [ ] Add Time Off - Start/End dates
- [ ] Mark Attendance - Date and times
- [ ] Add Payment - Payment date

### Excel Reports
- [ ] Download attendance report (all employees)
- [ ] Download payment report (all employees)
- [ ] Download with single employee filter
- [ ] Download with multiple employees filter
- [ ] Download with custom date range
- [ ] Verify Excel file opens correctly
- [ ] Check data accuracy and sorting

### Data Cleanup
- [ ] Check cleanup configuration: `GET /api/admin/cleanup/config`
- [ ] Trigger manual cleanup: `POST /api/admin/cleanup`
- [ ] Verify old records deleted
- [ ] Confirm employee records retained
- [ ] Check logs for cleanup execution

---

## 📞 Support

For issues or questions:
1. Check relevant documentation file
2. Review logs (backend console or mobile Metro bundler)
3. Verify configuration in `application.properties`
4. Check API endpoints with Postman/curl

---

**Last Updated**: 2026-05-14
**Version**: 1.0.0
**Status**: ✅ Production Ready
