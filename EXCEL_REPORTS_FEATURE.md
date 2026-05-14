# Excel Reports Feature

## Overview
This feature allows you to download Excel reports for attendance history and payment history with advanced filtering options.

## Features

### 1. **Date Range Selection**
- Select custom start and end dates for the report
- Default: Current month (1st to today)

### 2. **Employee Filtering**
- **All Employees**: Leave selection empty or click "Select All"
- **Single Employee**: Select one employee from the list
- **Multiple Employees**: Select specific employees using checkboxes
- **Group Selection**: Use "Select All" to include all active employees

### 3. **Report Types**

#### Attendance Report
- Employee Name
- Date
- Check In Time
- Check Out Time
- Status (Present/Absent)
- Notes
- **Sorted by**: Employee name, then by date

#### Payment Report
- Employee Name
- Date
- Amount (₹)
- Payment Type (Salary, Advance, Bonus, Deduction)
- Description
- **Total Amount** calculated at the bottom
- **Sorted by**: Employee name, then by date

## Backend Implementation

### Dependencies Added
```xml
<!-- Apache POI for Excel generation -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
    <version>5.2.5</version>
</dependency>
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version>
</dependency>
```

### New Files Created

#### 1. **ExcelExportService.java**
Location: `/backend/src/main/java/com/farmtime/service/ExcelExportService.java`

**Methods:**
- `exportAttendanceReport(List<Long> employeeIds, LocalDate startDate, LocalDate endDate)`
- `exportPaymentReport(List<Long> employeeIds, LocalDate startDate, LocalDate endDate)`
- Excel styling and formatting utilities

**Features:**
- Professional Excel formatting with headers
- Auto-sized columns
- Currency formatting for amounts
- Date formatting (dd-MM-yyyy)
- Title and date range display
- Color-coded headers (dark green background, white text)

#### 2. **ReportController.java**
Location: `/backend/src/main/java/com/farmtime/controller/ReportController.java`

**Endpoints:**
- `GET /api/reports/attendance/export`
  - Query params: `employeeIds` (optional), `startDate`, `endDate`
  - Returns: Excel file (.xlsx)
  
- `GET /api/reports/payments/export`
  - Query params: `employeeIds` (optional), `startDate`, `endDate`
  - Returns: Excel file (.xlsx)

### Repository Updates

#### AttendanceRepository.java
Added method:
```java
List<Attendance> findByEmployeeInAndAttendanceDateBetween(List<Employee> employees, LocalDate startDate, LocalDate endDate);
```

#### PaymentRepository.java
Added method:
```java
List<Payment> findByEmployeeInAndPaymentDateBetween(List<Employee> employees, LocalDate startDate, LocalDate endDate);
```

## Mobile App Implementation

### Dependencies Added
```json
"expo-file-system": "~16.0.9",
"expo-sharing": "~11.10.0"
```

### New Files Created

#### ReportsScreen.js
Location: `/mobile/src/screens/ReportsScreen.js`

**Features:**
- Date range picker (Start Date & End Date)
- Employee selection with checkboxes
- "Select All" / "Deselect All" functionality
- Visual indicator when no employees selected (defaults to all)
- Two download buttons:
  - Download Attendance Report (Green)
  - Download Payment Report (Blue)
- Loading states during download
- File sharing integration

### API Service Updates

#### api.js
Added methods:
```javascript
exportAttendanceReport(employeeIds, startDate, endDate)
exportPaymentReport(employeeIds, startDate, endDate)
```

### Navigation Updates

#### MainNavigator.js
- Added "Reports" tab with file-chart icon
- Accessible from bottom navigation bar

## Usage Instructions

### Mobile App

1. **Open Reports Tab**
   - Tap on the "Reports" icon in the bottom navigation

2. **Select Date Range**
   - Tap "Start Date" to select the beginning of the period
   - Tap "End Date" to select the end of the period

3. **Select Employees** (Optional)
   - Leave empty for all employees
   - Check specific employees for filtered report
   - Use "Select All" for all active employees

4. **Download Report**
   - Tap "Download Attendance Report" for attendance data
   - Tap "Download Payment Report" for payment data
   - Wait for the download to complete
   - Share or save the Excel file

### Backend API

#### Attendance Report
```bash
GET http://localhost:8080/api/reports/attendance/export?startDate=2024-01-01&endDate=2024-01-31
GET http://localhost:8080/api/reports/attendance/export?employeeIds=1,2,3&startDate=2024-01-01&endDate=2024-01-31
```

#### Payment Report
```bash
GET http://localhost:8080/api/reports/payments/export?startDate=2024-01-01&endDate=2024-01-31
GET http://localhost:8080/api/reports/payments/export?employeeIds=1,2,3&startDate=2024-01-01&endDate=2024-01-31
```

## File Naming Convention

Reports are automatically named with the date range:
- Attendance: `Attendance_Report_DDMMYYYY_to_DDMMYYYY.xlsx`
- Payment: `Payment_Report_DDMMYYYY_to_DDMMYYYY.xlsx`

Example: `Attendance_Report_01012024_to_31012024.xlsx`

## Excel Report Structure

### Attendance Report
```
Row 1: Title - "Attendance Report"
Row 2: Date Range - "Period: DD-MM-YYYY to DD-MM-YYYY"
Row 3: (Empty)
Row 4: Headers - S.No | Employee Name | Date | Check In | Check Out | Status | Notes
Row 5+: Data rows
```

### Payment Report
```
Row 1: Title - "Payment Report"
Row 2: Date Range - "Period: DD-MM-YYYY to DD-MM-YYYY"
Row 3: (Empty)
Row 4: Headers - S.No | Employee Name | Date | Amount (₹) | Payment Type | Description
Row 5+: Data rows
Last Row: Total Amount
```

## Testing

### Backend
1. Start the backend server
2. Use Postman or curl to test the endpoints
3. Verify Excel file downloads correctly
4. Check data accuracy and formatting

### Mobile App
1. Rebuild the app after installing new dependencies:
   ```bash
   cd mobile
   npx expo prebuild --clean
   npx expo run:android
   ```
2. Navigate to Reports tab
3. Test date selection
4. Test employee selection (all, single, multiple)
5. Download both report types
6. Verify file sharing works

## Notes

- Reports are sorted alphabetically by employee name, then chronologically by date
- Empty employee selection defaults to all employees
- Date range is inclusive (includes both start and end dates)
- Excel files use .xlsx format (Excel 2007+)
- Mobile app uses Expo's file system and sharing APIs
- Backend uses Apache POI for Excel generation

## Troubleshooting

### Backend Issues
- **Maven build fails**: Run `mvn clean install` to download POI dependencies
- **Large reports timeout**: Consider implementing pagination or async processing

### Mobile Issues
- **File not downloading**: Check network connection and API URL
- **Sharing not available**: Ensure device supports file sharing
- **Date picker not showing**: Verify DateTimePicker is properly installed

## Future Enhancements
- Add more report types (Time Off, Summary Reports)
- Email reports directly from the app
- Schedule automatic report generation
- Add charts and graphs to Excel reports
- Export to PDF format
- Cloud storage integration (Google Drive, Dropbox)
