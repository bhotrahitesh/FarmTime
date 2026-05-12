# FarmTime Backend

Spring Boot REST API for FarmTime Poultry Farm Management System.

## Quick Start

1. **Setup PostgreSQL Database**:
   ```sql
   CREATE DATABASE farmtime_db;
   ```

2. **Configure Database** in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/farmtime_db
   spring.datasource.username=postgres
   spring.datasource.password=your_password
   ```

3. **Run Application**:
   ```bash
   mvn spring-boot:run
   ```

4. **Create First Admin**:
   ```bash
   curl -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123","name":"Admin User"}'
   ```

## API Documentation

### Authentication Required
All endpoints except `/api/auth/**` require JWT token in header:
```
Authorization: Bearer <token>
```

### Scheduled Tasks
- **Data Cleanup**: Runs daily at 2:00 AM
- Deletes records older than 2 months (attendance, payments, time-off)

## Configuration

### Database
- **URL**: `jdbc:postgresql://localhost:5432/farmtime_db`
- **Hibernate**: Auto-update schema on startup

### Security
- **JWT Secret**: Change in production (application.properties)
- **Token Expiration**: 24 hours (86400000 ms)

### CORS
- Configured for mobile app access
- Update `cors.allowed.origins` for production

## Building for Production

```bash
mvn clean package
java -jar target/farmtime-backend-1.0.0.jar
```

## Database Schema

Tables created automatically:
- `admins` - Admin users
- `employees` - Employee information
- `attendance` - Daily attendance records
- `payments` - Payment transactions
- `time_off` - Leave/holiday records
