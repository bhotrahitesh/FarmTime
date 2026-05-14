# Indian Standard Time (IST) Configuration

## Overview
The FarmTime application is configured to use **Indian Standard Time (IST)** exclusively throughout the entire system - both backend and mobile app.

**Timezone**: Asia/Kolkata (UTC+5:30)

---

## Backend Configuration (Spring Boot)

### 1. Application Properties
**File**: `/backend/src/main/resources/application.properties`

```properties
# JPA/Hibernate Timezone
spring.jpa.properties.hibernate.jdbc.time_zone=Asia/Kolkata

# Jackson JSON Serialization Timezone
spring.jackson.time-zone=Asia/Kolkata
spring.jackson.date-format=yyyy-MM-dd
```

**What this does**:
- `hibernate.jdbc.time_zone`: Sets database connection timezone to IST
- `spring.jackson.time-zone`: Ensures JSON date/time serialization uses IST
- `spring.jackson.date-format`: Standardizes date format in API responses

### 2. Timezone Configuration Class
**File**: `/backend/src/main/java/com/farmtime/config/TimezoneConfig.java`

```java
@Configuration
public class TimezoneConfig {
    @PostConstruct
    public void init() {
        // Set default timezone to IST for the entire application
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
        System.out.println("Application timezone set to: " + TimeZone.getDefault().getID());
    }
}
```

**What this does**:
- Sets JVM default timezone to IST when application starts
- Applies to all date/time operations in the backend
- Logs timezone confirmation on startup

### 3. Scheduled Tasks
The data cleanup cron job runs at **2 AM IST**:

```properties
data.cleanup.cron=0 0 2 * * ?
```

This executes at 2:00 AM Indian Standard Time every day.

---

## Mobile App Configuration (React Native/Expo)

### Date Formatter Utility
**File**: `/mobile/src/utils/dateFormatter.js`

All date formatting functions use IST timezone:

#### 1. **formatDate()**
```javascript
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-IN', { 
    month: 'short', 
    timeZone: 'Asia/Kolkata' 
  });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
```

**Output**: `14-May-2026`

#### 2. **formatDateForDisplay()**
```javascript
export const formatDateForDisplay = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-IN', { 
    month: 'short', 
    timeZone: 'Asia/Kolkata' 
  });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
```

**Output**: `14-May-2026`

#### 3. **getCurrentISTDate()**
```javascript
export const getCurrentISTDate = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utcTime + istOffset);
};
```

**Returns**: Current date/time in IST

#### 4. **formatTime12Hour()**
```javascript
export const formatTime12Hour = (date) => {
  return date.toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
};
```

**Output**: `02:30 PM`

#### 5. **formatTime24Hour()**
```javascript
export const formatTime24Hour = (date) => {
  return date.toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata'
  });
};
```

**Output**: `14:30`

---

## How It Works

### Date/Time Flow

1. **User Input** (Mobile App)
   - User selects date/time using DateTimePicker
   - Date is in device's local timezone

2. **API Request** (Mobile → Backend)
   - Date converted to ISO format: `2026-05-14T00:00:00.000Z`
   - Sent to backend API

3. **Backend Processing**
   - Spring Boot receives date
   - Hibernate converts to IST (Asia/Kolkata)
   - Stored in PostgreSQL database

4. **Database Storage**
   - All dates stored in IST
   - PostgreSQL uses IST timezone

5. **API Response** (Backend → Mobile)
   - Jackson serializes dates in IST
   - Format: `2026-05-14`

6. **Mobile Display**
   - Date formatter applies IST timezone
   - Displays: `14-May-2026`

---

## Benefits of IST Configuration

### 1. **Consistency**
- All dates/times are in the same timezone
- No confusion between UTC, local, or other timezones
- Predictable behavior across the system

### 2. **Accuracy**
- Scheduled tasks run at correct IST times
- Reports show accurate Indian time
- Attendance records reflect actual Indian working hours

### 3. **Simplicity**
- No timezone conversions needed
- Developers don't need to worry about timezone issues
- Users see dates in their local (Indian) time

### 4. **Compliance**
- Matches Indian business hours
- Aligns with Indian calendar and holidays
- Suitable for Indian labor laws and regulations

---

## Examples

### Scenario 1: Attendance Marking
**Time**: 9:00 AM IST on 14-May-2026

1. User marks attendance at 9:00 AM
2. Mobile app captures: `2026-05-14T09:00:00+05:30`
3. Backend stores: `2026-05-14 09:00:00` (IST)
4. Display shows: `14-May-2026, 09:00 AM`

### Scenario 2: Data Cleanup
**Scheduled**: 2:00 AM IST daily

1. Cron expression: `0 0 2 * * ?`
2. Executes at: 2:00 AM IST (not UTC)
3. Deletes records older than 2 months (IST dates)

### Scenario 3: Payment Record
**Date**: 10-May-2026

1. User adds payment on 10-May-2026
2. Stored as: `2026-05-10` (IST)
3. Excel report shows: `10-May-2026`
4. Always displays in IST format

---

## Testing IST Configuration

### Backend

1. **Check Application Startup**
   ```
   Application timezone set to: Asia/Kolkata
   ```

2. **Test API Response**
   ```bash
   curl http://localhost:8080/api/employees
   ```
   Verify dates are in IST format.

3. **Check Database**
   ```sql
   SELECT NOW();  -- Should show IST time
   ```

### Mobile App

1. **Test Date Display**
   - Open any screen with dates
   - Verify format: `dd-MMM-yyyy`
   - Example: `14-May-2026`

2. **Test Time Display**
   - Mark attendance
   - Check time format: `HH:MM AM/PM`
   - Example: `09:30 AM`

3. **Test Date Picker**
   - Select a date
   - Verify it saves correctly
   - Check in backend database

---

## Troubleshooting

### Issue: Dates showing wrong timezone

**Solution**:
1. Verify `TimezoneConfig.java` is loaded
2. Check application.properties settings
3. Restart backend application
4. Clear mobile app cache

### Issue: Scheduled tasks running at wrong time

**Solution**:
1. Check server system timezone: `date`
2. Verify cron expression in application.properties
3. Check logs for actual execution time
4. Ensure TimezoneConfig is applied

### Issue: Database storing UTC instead of IST

**Solution**:
1. Check `hibernate.jdbc.time_zone` property
2. Verify PostgreSQL timezone: `SHOW timezone;`
3. Restart database connection pool
4. Re-run application

---

## Important Notes

### 1. **Server Location**
Even if the server is hosted outside India (e.g., AWS Mumbai, US, etc.), the application will use IST.

### 2. **Daylight Saving Time**
India does not observe Daylight Saving Time, so IST is always UTC+5:30.

### 3. **Database Timezone**
PostgreSQL database should also be configured to use IST for consistency:
```sql
ALTER DATABASE farmtime_db SET timezone TO 'Asia/Kolkata';
```

### 4. **Mobile Device Timezone**
The app will display dates in IST regardless of the device's timezone setting.

---

## Configuration Summary

| Component | Configuration | Value |
|-----------|--------------|-------|
| Backend JVM | TimeZone.setDefault() | Asia/Kolkata |
| Hibernate | jdbc.time_zone | Asia/Kolkata |
| Jackson | time-zone | Asia/Kolkata |
| Mobile Formatter | timeZone | Asia/Kolkata |
| Locale | en-IN | Indian English |
| Offset | UTC | +05:30 |
| Cron Jobs | Timezone | IST |

---

## Future Considerations

### If Multi-Timezone Support Needed

If the app needs to support multiple timezones in the future:

1. **Store UTC in Database**
   - Change to store all dates in UTC
   - Convert to IST for display

2. **Add User Timezone Preference**
   - Allow users to select timezone
   - Convert dates based on preference

3. **Update Date Formatter**
   - Accept timezone parameter
   - Format based on user preference

**Current Status**: Single timezone (IST) only - no multi-timezone support needed.

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-14  
**Status**: ✅ Configured and Active  
**Timezone**: Asia/Kolkata (IST, UTC+5:30)
