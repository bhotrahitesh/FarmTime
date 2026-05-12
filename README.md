# FarmTime - Poultry Farm Management System

A comprehensive mobile application for managing timesheet, attendance, and payment tracking for poultry farm employees.

## Features

- **Employee Management**: Add, update, and manage employee information
- **Daily Attendance Tracking**: Mark check-in/check-out times for employees
- **Payment Management**: Track salaries, advances, bonuses, and deductions in Indian Rupees (₹)
- **Time Off Management**: Track holidays, sick leaves, and other time-off requests
- **Admin-Only Access**: Secure authentication for admin users only
- **Automatic Data Cleanup**: Automatically deletes data older than 2 months
- **Mobile-Ready**: Works on both Android and iOS devices

## Technology Stack

### Backend
- **Java Spring Boot 3.2.0**
- **PostgreSQL Database**
- **Spring Security with JWT Authentication**
- **Maven for dependency management**

### Frontend
- **React Native with Expo**
- **React Navigation for routing**
- **React Native Paper for UI components**
- **Axios for API calls**

## Project Structure

```
FarmTime/
├── backend/                    # Spring Boot backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/farmtime/
│   │       │   ├── controller/     # REST API controllers
│   │       │   ├── model/          # JPA entities
│   │       │   ├── repository/     # Data repositories
│   │       │   ├── service/        # Business logic
│   │       │   ├── security/       # Security & JWT config
│   │       │   └── dto/            # Data transfer objects
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml
│
└── mobile/                     # React Native mobile app
    ├── src/
    │   ├── screens/           # App screens
    │   ├── navigation/        # Navigation setup
    │   ├── services/          # API services
    │   └── context/           # React context
    ├── App.js
    └── package.json
```

## Setup Instructions

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup

1. **Install PostgreSQL** and create a database:
   ```sql
   CREATE DATABASE farmtime_db;
   ```

2. **Configure Database** in `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/farmtime_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. **Build and Run** the backend:
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

4. **Create Admin User** (First time only):
   ```bash
   curl -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "admin",
       "password": "admin123",
       "name": "Admin User"
     }'
   ```

### Mobile App Setup

1. **Install Dependencies**:
   ```bash
   cd mobile
   npm install
   ```

2. **Update API URL** in `mobile/src/services/api.js`:
   - For iOS Simulator: `http://localhost:8080/api`
   - For Android Emulator: `http://10.0.2.2:8080/api`
   - For Physical Device: `http://YOUR_COMPUTER_IP:8080/api`

3. **Start the App**:
   ```bash
   npm start
   ```

4. **Run on Device**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Register new admin

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/active` - Get active employees
- `GET /api/employees/{id}` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/{id}` - Update employee
- `DELETE /api/employees/{id}` - Deactivate employee

### Attendance
- `GET /api/attendance?startDate={date}&endDate={date}` - Get attendance by date range
- `GET /api/attendance/employee/{id}?startDate={date}&endDate={date}` - Get employee attendance
- `POST /api/attendance` - Mark attendance
- `PUT /api/attendance/{id}` - Update attendance
- `DELETE /api/attendance/{id}` - Delete attendance

### Payments
- `GET /api/payments?startDate={date}&endDate={date}` - Get payments by date range
- `GET /api/payments/employee/{id}` - Get employee payments
- `POST /api/payments` - Create payment
- `PUT /api/payments/{id}` - Update payment
- `DELETE /api/payments/{id}` - Delete payment

### Time Off
- `GET /api/timeoff?startDate={date}&endDate={date}` - Get time off by date range
- `GET /api/timeoff/employee/{id}` - Get employee time off
- `POST /api/timeoff` - Create time off
- `PUT /api/timeoff/{id}` - Update time off
- `DELETE /api/timeoff/{id}` - Delete time off

## Data Models

### Employee
- Name, Phone Number, Address
- Joining Date, Monthly Salary
- Active Status

### Attendance
- Employee Reference
- Attendance Date
- Check-in Time, Check-out Time
- Present/Absent Status
- Notes

### Payment
- Employee Reference
- Payment Date, Amount (₹)
- Payment Type (SALARY, ADVANCE, BONUS, DEDUCTION)
- Description

### Time Off
- Employee Reference
- Start Date, End Date
- Type (SICK_LEAVE, CASUAL_LEAVE, HOLIDAY, UNPAID_LEAVE)
- Reason

## Automatic Data Cleanup

The system automatically deletes records older than 2 months:
- Runs daily at 2:00 AM
- Cleans up attendance, payment, and time-off records
- Employee records are preserved (only deactivated)

## Security

- JWT-based authentication
- Admin-only access to all features
- Secure password encryption with BCrypt
- Token expiration after 24 hours

## Default Login Credentials

After registration, use your created credentials:
- **Username**: admin (or your chosen username)
- **Password**: admin123 (or your chosen password)

## Troubleshooting

### Backend Issues
- **Database Connection Error**: Check PostgreSQL is running and credentials are correct
- **Port Already in Use**: Change port in `application.properties`

### Mobile App Issues
- **Cannot Connect to Backend**: Update API URL with correct IP address
- **Expo Build Errors**: Clear cache with `expo start -c`
- **Network Error**: Ensure backend is running and accessible from device

## Production Deployment

### Backend
1. Update `application.properties` for production database
2. Change JWT secret key
3. Build JAR: `mvn clean package`
4. Deploy to server: `java -jar target/farmtime-backend-1.0.0.jar`

### Mobile App
1. Update API URL to production server
2. Build standalone app:
   - Android: `expo build:android`
   - iOS: `expo build:ios`
3. Publish to app stores

## Support

For issues or questions, please contact the development team.

## License

Proprietary - All rights reserved
