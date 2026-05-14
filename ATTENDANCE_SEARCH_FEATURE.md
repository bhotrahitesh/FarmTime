# Attendance Search & Filter Feature

## Overview
Enhanced the Attendance screen with search and filter capabilities, plus standardized date format across the entire application.

## Features Implemented

### 1. **Search by Employee Name**
- Real-time search as you type
- Case-insensitive matching
- Filters attendance records by employee name
- Clear search to show all records

### 2. **Filter by Month**
- Dropdown menu to select any month
- Shows current month by default
- Displays month and year (e.g., "May 2026")
- Automatically loads attendance for selected month
- Selected month is highlighted in green

### 3. **Standardized Date Format**
- **New Format**: `dd-MMM-yyyy` (e.g., 14-May-2026)
- **Old Format**: `dd/MM/yyyy` (e.g., 14/05/2026)
- Applied consistently across all screens

## User Interface

### Attendance Screen Layout
```
┌─────────────────────────────────────┐
│  Search by employee name     [🔍]   │
│  [May 2026 ▼]                       │
├─────────────────────────────────────┤
│  Employee Cards (filtered results)  │
│  - Name                    [Present]│
│  - Date: 14-May-2026               │
│  - Check In: 09:00                 │
│  - Check Out: 17:00                │
└─────────────────────────────────────┘
                              [+ FAB]
```

## Implementation Details

### New Files Created

#### 1. `/mobile/src/utils/dateFormatter.js`
Centralized date formatting utilities:

**Functions**:
```javascript
formatDate(dateString)           // Format date as dd-MMM-yyyy
formatDateForDisplay(date)       // Format Date object for display
getMonthName(monthIndex)         // Get month name from index (0-11)
getAllMonths()                   // Get array of all month names
```

**Usage Example**:
```javascript
import { formatDate } from '../utils/dateFormatter';

const formatted = formatDate('2026-05-14');  // Returns: "14-May-2026"
```

### Files Modified

#### 1. AttendanceScreen.js
**New Features**:
- Search bar for employee name filtering
- Month selector dropdown
- Real-time filtering
- Updated date display format

**New State Variables**:
```javascript
const [filteredAttendance, setFilteredAttendance] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
const [monthMenuVisible, setMonthMenuVisible] = useState(false);
```

### Search by Employee Name

1. **Open Attendance Screen**
2. **Type in search bar** at the top
3. **Results filter automatically** as you type
4. **Clear search** to show all records

**Example**:
- Type "John" → Shows only John's attendance
- Type "raj" → Shows all employees with "raj" in their name (case-insensitive)

### Filter by Month

1. **Tap the month button** (e.g., "May 2026")
2. **Select a month** from the dropdown
3. **Attendance loads automatically** for that month
4. **Current month is highlighted** in green

**Example**:
- Tap "May 2026"
- Select "April" from list
- View April's attendance records

### Combined Search & Filter

You can use both features together:
1. Select a month (e.g., "April 2026")
2. Search for an employee (e.g., "John")
3. See John's attendance for April only

## Date Format Examples

### Before (Old Format)
```
Date: 14/05/2026
Joining Date: 01/01/2026
Start Date: 10/05/2026
```

### After (New Format)
```
Date: 14-May-2026
Joining Date: 01-Jan-2026
Start Date: 10-May-2026
```

## Technical Details

### Search Algorithm
```javascript
const filtered = attendance.filter((item) =>
  item.employeeName.toLowerCase().includes(query.toLowerCase())
);
```
- Case-insensitive
- Partial matching
- Real-time filtering

### Month Loading
```javascript
const startDate = new Date(selectedYear, selectedMonth, 1);
const endDate = new Date(selectedYear, selectedMonth + 1, 0);
```
- Loads first to last day of selected month
- Automatically handles different month lengths
- Works across year boundaries

### Date Formatting
```javascript
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
```
- Uses JavaScript's built-in date formatting
- Locale-aware month names
- Zero-padded days

## Styling

### New Styles Added
```javascript
filterContainer: {
  padding: 16,
  backgroundColor: 'white',
  elevation: 2,
}

searchBar: {
  marginBottom: 12,
  elevation: 0,
}

monthButton: {
  marginBottom: 8,
}

selectedMonth: {
  fontWeight: 'bold',
  color: '#4CAF50',
}
```

## Performance Considerations

### Search Optimization
- Filters on client-side (fast for <1000 records)
- No API calls during search
- Instant results

### Month Loading
- Only loads one month at a time
- Reduces data transfer
- Faster initial load

## Testing Checklist

### Search Functionality
- [ ] Search with full name
- [ ] Search with partial name
- [ ] Search is case-insensitive
- [ ] Clear search shows all records
- [ ] Search with no results shows empty list
- [ ] Search works after changing month

### Month Filter
- [ ] Default shows current month
- [ ] Can select any month
- [ ] Selected month is highlighted
- [ ] Attendance loads for selected month
- [ ] Month persists during search
- [ ] Can navigate between months

### Date Format
- [ ] Attendance screen shows dd-MMM-yyyy
- [ ] Reports screen shows dd-MMM-yyyy
- [ ] Add Employee shows dd-MMM-yyyy
- [ ] Add Time Off shows dd-MMM-yyyy
- [ ] Add Payment shows dd-MMM-yyyy
- [ ] Mark Attendance shows dd-MMM-yyyy

## Known Limitations

1. **Year Selection**: Currently only shows current year months
   - Future enhancement: Add year selector

2. **Search Scope**: Only searches employee name
   - Future enhancement: Search by date, status, notes

3. **Month Range**: Shows all 12 months
   - Future enhancement: Only show months with data

## Future Enhancements

- [ ] Add year selector
- [ ] Search by multiple fields (date, status, notes)
- [ ] Save search/filter preferences
- [ ] Export filtered results
- [ ] Quick filters (Present/Absent, This Week, etc.)
- [ ] Sort options (by date, by name, by status)
- [ ] Date range picker (custom start/end dates)

## Troubleshooting

### Search Not Working
**Issue**: Search doesn't filter results
**Solution**: 
- Check if `filteredAttendance` is being used in FlatList
- Verify `handleSearch` function is called
- Check console for errors

### Month Not Loading
**Issue**: Selecting month doesn't load data
**Solution**:
- Check API endpoint is accessible
- Verify date range calculation
- Check network tab for API calls

### Date Format Not Showing
**Issue**: Dates still show old format
**Solution**:
- Ensure `formatDate` is imported
- Check function is called in render
- Verify dateFormatter.js exists

## Migration Notes

### For Developers
If you add new screens with dates:
1. Import date formatter: `import { formatDate } from '../utils/dateFormatter';`
2. Use for display: `{formatDate(dateString)}`
3. Keep ISO format for API: `date.toISOString().split('T')[0]`

### For Users
- No action required
- Date format changes automatically
- All existing data displays correctly

---

**Version**: 1.0.0
**Last Updated**: 2026-05-14
**Status**: ✅ Ready for Testing
