# FarmTime Database Schema

## Overview
The database automatically creates tables on first run. This document describes the schema structure.

## Tables

### 1. admins
Stores admin user credentials for authentication.

| Column      | Type         | Constraints           | Description                    |
|-------------|--------------|----------------------|--------------------------------|
| id          | BIGINT       | PRIMARY KEY, AUTO    | Unique admin identifier        |
| username    | VARCHAR(255) | NOT NULL, UNIQUE     | Login username                 |
| password    | VARCHAR(255) | NOT NULL             | Encrypted password (BCrypt)    |
| name        | VARCHAR(255) | NOT NULL             | Admin's full name              |
| is_active   | BOOLEAN      | NOT NULL, DEFAULT true| Account active status         |
| created_at  | TIMESTAMP    | NOT NULL             | Account creation timestamp     |
| updated_at  | TIMESTAMP    | NOT NULL             | Last update timestamp          |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `username`

---

### 2. employees
Stores employee information.

| Column         | Type         | Constraints           | Description                    |
|----------------|--------------|----------------------|--------------------------------|
| id             | BIGINT       | PRIMARY KEY, AUTO    | Unique employee identifier     |
| name           | VARCHAR(255) | NOT NULL             | Employee's full name           |
| phone_number   | VARCHAR(255) | NOT NULL, UNIQUE     | Contact phone number           |
| address        | TEXT         |                      | Residential address            |
| joining_date   | DATE         | NOT NULL             | Date of joining                |
| monthly_salary | DOUBLE       | NOT NULL             | Monthly salary in INR          |
| is_active      | BOOLEAN      | NOT NULL, DEFAULT true| Employment status             |
| created_at     | TIMESTAMP    | NOT NULL             | Record creation timestamp      |
| updated_at     | TIMESTAMP    | NOT NULL             | Last update timestamp          |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `phone_number`
- INDEX on `is_active` (for filtering active employees)

**Notes:**
- Employees are never deleted, only deactivated (is_active = false)
- Monthly salary stored in Indian Rupees (₹)

---

### 3. attendance
Tracks daily attendance records.

| Column          | Type         | Constraints           | Description                    |
|-----------------|--------------|----------------------|--------------------------------|
| id              | BIGINT       | PRIMARY KEY, AUTO    | Unique attendance record ID    |
| employee_id     | BIGINT       | NOT NULL, FOREIGN KEY| Reference to employees table   |
| attendance_date | DATE         | NOT NULL             | Date of attendance             |
| check_in_time   | TIME         | NOT NULL             | Check-in time                  |
| check_out_time  | TIME         |                      | Check-out time (nullable)      |
| is_present      | BOOLEAN      | NOT NULL, DEFAULT true| Present/Absent status         |
| notes           | TEXT         |                      | Additional notes               |
| created_at      | TIMESTAMP    | NOT NULL             | Record creation timestamp      |
| updated_at      | TIMESTAMP    | NOT NULL             | Last update timestamp          |

**Indexes:**
- PRIMARY KEY on `id`
- FOREIGN KEY on `employee_id` REFERENCES `employees(id)`
- UNIQUE INDEX on (`employee_id`, `attendance_date`)
- INDEX on `attendance_date` (for date range queries)

**Constraints:**
- One attendance record per employee per day
- Records older than 2 months are automatically deleted

---

### 4. payments
Tracks all payment transactions.

| Column       | Type         | Constraints           | Description                    |
|--------------|--------------|----------------------|--------------------------------|
| id           | BIGINT       | PRIMARY KEY, AUTO    | Unique payment record ID       |
| employee_id  | BIGINT       | NOT NULL, FOREIGN KEY| Reference to employees table   |
| payment_date | DATE         | NOT NULL             | Date of payment                |
| amount       | DOUBLE       | NOT NULL             | Payment amount in INR          |
| payment_type | VARCHAR(50)  | NOT NULL             | Type of payment (enum)         |
| description  | TEXT         |                      | Payment description            |
| created_at   | TIMESTAMP    | NOT NULL             | Record creation timestamp      |
| updated_at   | TIMESTAMP    | NOT NULL             | Last update timestamp          |

**Payment Types (Enum):**
- `SALARY` - Regular monthly salary
- `ADVANCE` - Advance payment
- `BONUS` - Bonus payment
- `DEDUCTION` - Salary deduction

**Indexes:**
- PRIMARY KEY on `id`
- FOREIGN KEY on `employee_id` REFERENCES `employees(id)`
- INDEX on `payment_date` (for date range queries)
- INDEX on (`employee_id`, `payment_date`)

**Constraints:**
- Amount stored in Indian Rupees (₹)
- Records older than 2 months are automatically deleted

---

### 5. time_off
Tracks employee time off (leaves, holidays).

| Column        | Type         | Constraints           | Description                    |
|---------------|--------------|----------------------|--------------------------------|
| id            | BIGINT       | PRIMARY KEY, AUTO    | Unique time off record ID      |
| employee_id   | BIGINT       | NOT NULL, FOREIGN KEY| Reference to employees table   |
| start_date    | DATE         | NOT NULL             | Leave start date               |
| end_date      | DATE         | NOT NULL             | Leave end date                 |
| time_off_type | VARCHAR(50)  | NOT NULL             | Type of time off (enum)        |
| reason        | TEXT         |                      | Reason for time off            |
| created_at    | TIMESTAMP    | NOT NULL             | Record creation timestamp      |
| updated_at    | TIMESTAMP    | NOT NULL             | Last update timestamp          |

**Time Off Types (Enum):**
- `SICK_LEAVE` - Medical/sick leave
- `CASUAL_LEAVE` - Casual leave
- `HOLIDAY` - Public/farm holiday
- `UNPAID_LEAVE` - Leave without pay

**Indexes:**
- PRIMARY KEY on `id`
- FOREIGN KEY on `employee_id` REFERENCES `employees(id)`
- INDEX on `start_date`
- INDEX on `end_date`
- INDEX on (`employee_id`, `start_date`)

**Constraints:**
- end_date must be >= start_date (application level validation)
- Records older than 2 months are automatically deleted

---

## Relationships

```
admins (1) ─────────────────────────────────────── (manages all data)

employees (1) ──┬── (many) attendance
                ├── (many) payments
                └── (many) time_off
```

## Data Retention Policy

**Automatic Cleanup (Runs Daily at 2:00 AM):**
- `attendance`: Records older than 2 months are deleted
- `payments`: Records older than 2 months are deleted
- `time_off`: Records older than 2 months are deleted
- `employees`: Never deleted, only deactivated
- `admins`: Never deleted

**Calculation:**
- Cutoff Date = Current Date - 2 months
- Example: If today is 2026-05-11, records before 2026-03-11 are deleted

## Sample Queries

### Get Active Employees
```sql
SELECT * FROM employees WHERE is_active = true;
```

### Get Attendance for Current Month
```sql
SELECT a.*, e.name as employee_name
FROM attendance a
JOIN employees e ON a.employee_id = e.id
WHERE a.attendance_date >= DATE_TRUNC('month', CURRENT_DATE)
  AND a.attendance_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
```

### Get Total Payments by Employee
```sql
SELECT e.name, 
       SUM(CASE WHEN p.payment_type = 'SALARY' THEN p.amount ELSE 0 END) as total_salary,
       SUM(CASE WHEN p.payment_type = 'ADVANCE' THEN p.amount ELSE 0 END) as total_advance,
       SUM(CASE WHEN p.payment_type = 'BONUS' THEN p.amount ELSE 0 END) as total_bonus,
       SUM(CASE WHEN p.payment_type = 'DEDUCTION' THEN p.amount ELSE 0 END) as total_deduction
FROM employees e
LEFT JOIN payments p ON e.id = p.employee_id
WHERE e.is_active = true
GROUP BY e.id, e.name;
```

### Get Time Off for Current Month
```sql
SELECT t.*, e.name as employee_name
FROM time_off t
JOIN employees e ON t.employee_id = e.id
WHERE (t.start_date >= DATE_TRUNC('month', CURRENT_DATE)
   OR t.end_date >= DATE_TRUNC('month', CURRENT_DATE))
  AND t.start_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
```

## Backup Recommendations

1. **Daily Backups**: Schedule daily PostgreSQL backups
   ```bash
   pg_dump -U postgres farmtime_db > backup_$(date +%Y%m%d).sql
   ```

2. **Retention**: Keep backups for at least 3 months

3. **Test Restores**: Regularly test backup restoration

4. **Off-site Storage**: Store backups in a separate location

## Migration Notes

- Schema is automatically created/updated by Hibernate on application startup
- For production, set `spring.jpa.hibernate.ddl-auto=validate` to prevent auto-updates
- Use Flyway or Liquibase for controlled migrations in production
