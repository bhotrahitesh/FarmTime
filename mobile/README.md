# FarmTime Mobile App

React Native mobile application for FarmTime Poultry Farm Management.

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Update API URL** in `src/services/api.js`:
   ```javascript
   const API_BASE_URL = 'http://YOUR_IP:8080/api';
   ```
   - iOS Simulator: `http://localhost:8080/api`
   - Android Emulator: `http://10.0.2.2:8080/api`
   - Physical Device: `http://YOUR_COMPUTER_IP:8080/api`

3. **Start Development Server**:
   ```bash
   npm start
   ```

4. **Run on Device**:
   - iOS: Press `i`
   - Android: Press `a`
   - Physical: Scan QR with Expo Go app

## Features

### Home Dashboard
- Quick access to all modules
- Clean, modern UI with Material Design

### Employee Management
- View all active employees
- Add new employees
- View employee details
- Deactivate employees
- Search functionality

### Attendance Tracking
- Mark daily attendance
- Set check-in/check-out times
- Add notes
- View attendance history

### Payment Management
- Record salary payments
- Track advances
- Add bonuses/deductions
- View payment history
- Amount in Indian Rupees (₹)

### Time Off Management
- Record sick leaves
- Track casual leaves
- Mark holidays
- Record unpaid leaves
- Date range selection

## App Structure

```
src/
├── screens/          # All app screens
│   ├── LoginScreen.js
│   ├── HomeScreen.js
│   ├── EmployeesScreen.js
│   ├── AddEmployeeScreen.js
│   ├── EmployeeDetailScreen.js
│   ├── AttendanceScreen.js
│   ├── MarkAttendanceScreen.js
│   ├── PaymentsScreen.js
│   ├── AddPaymentScreen.js
│   ├── TimeOffScreen.js
│   └── AddTimeOffScreen.js
├── navigation/       # Navigation setup
│   └── MainNavigator.js
├── services/         # API integration
│   └── api.js
└── context/          # React context
    └── AuthContext.js
```

## Building for Production

### Android APK
```bash
expo build:android
```

### iOS IPA
```bash
expo build:ios
```

## Troubleshooting

### Cannot Connect to Backend
1. Ensure backend is running
2. Check API URL in `src/services/api.js`
3. For physical device, use computer's IP address
4. Ensure device and computer are on same network

### Expo Cache Issues
```bash
expo start -c
```

### Dependencies Issues
```bash
rm -rf node_modules
npm install
```

## UI Components

- **React Native Paper**: Material Design components
- **React Navigation**: Screen navigation
- **React Native Date Picker**: Date/time selection
- **Vector Icons**: Material Community Icons

## Color Scheme

- Primary: `#4CAF50` (Green)
- Success: `#4CAF50`
- Warning: `#FF9800`
- Error: `#F44336`
- Info: `#2196F3`
