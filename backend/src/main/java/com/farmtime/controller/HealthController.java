package com.farmtime.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HealthController {
    
    private final DataSource dataSource;
    
    @Value("${spring.datasource.url}")
    private String databaseUrl;
    
    @Value("${spring.datasource.username}")
    private String databaseUsername;
    
    @Value("${spring.application.name}")
    private String applicationName;
    
    /**
     * Basic health check endpoint
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("application", applicationName);
        health.put("timestamp", LocalDateTime.now());
        health.put("timezone", ZoneId.systemDefault().getId());
        
        return ResponseEntity.ok(health);
    }
    
    /**
     * Lightweight ping endpoint for keep-alive
     */
    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "alive");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Detailed database connection test
     */
    @GetMapping("/database")
    public ResponseEntity<Map<String, Object>> databaseHealth() {
        Map<String, Object> dbHealth = new HashMap<>();
        
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            
            // Connection info
            dbHealth.put("status", "CONNECTED");
            dbHealth.put("databaseProductName", metaData.getDatabaseProductName());
            dbHealth.put("databaseProductVersion", metaData.getDatabaseProductVersion());
            dbHealth.put("driverName", metaData.getDriverName());
            dbHealth.put("driverVersion", metaData.getDriverVersion());
            dbHealth.put("url", maskPassword(databaseUrl));
            dbHealth.put("username", databaseUsername);
            dbHealth.put("catalog", connection.getCatalog());
            dbHealth.put("schema", connection.getSchema());
            dbHealth.put("autoCommit", connection.getAutoCommit());
            dbHealth.put("readOnly", connection.isReadOnly());
            dbHealth.put("transactionIsolation", getTransactionIsolationName(connection.getTransactionIsolation()));
            
            // Get table list
            List<String> tables = new ArrayList<>();
            try (ResultSet rs = metaData.getTables(null, null, "%", new String[]{"TABLE"})) {
                while (rs.next()) {
                    String tableName = rs.getString("TABLE_NAME");
                    if (!tableName.startsWith("pg_") && !tableName.startsWith("sql_")) {
                        tables.add(tableName);
                    }
                }
            }
            dbHealth.put("tables", tables);
            dbHealth.put("tableCount", tables.size());
            
            // Test query
            try (var stmt = connection.createStatement();
                 var rs = stmt.executeQuery("SELECT NOW() as current_time, version() as db_version")) {
                if (rs.next()) {
                    dbHealth.put("currentDatabaseTime", rs.getTimestamp("current_time"));
                    dbHealth.put("fullVersion", rs.getString("db_version"));
                }
            }
            
            dbHealth.put("timestamp", LocalDateTime.now());
            dbHealth.put("message", "Database connection is healthy!");
            
            return ResponseEntity.ok(dbHealth);
            
        } catch (Exception e) {
            dbHealth.put("status", "ERROR");
            dbHealth.put("error", e.getMessage());
            dbHealth.put("errorType", e.getClass().getSimpleName());
            dbHealth.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.status(503).body(dbHealth);
        }
    }
    
    /**
     * Quick database ping test
     */
    @GetMapping("/database/ping")
    public ResponseEntity<Map<String, Object>> pingDatabase() {
        Map<String, Object> response = new HashMap<>();
        long startTime = System.currentTimeMillis();
        
        try (Connection connection = dataSource.getConnection()) {
            boolean isValid = connection.isValid(5); // 5 second timeout
            long responseTime = System.currentTimeMillis() - startTime;
            
            response.put("status", isValid ? "UP" : "DOWN");
            response.put("responseTimeMs", responseTime);
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            long responseTime = System.currentTimeMillis() - startTime;
            
            response.put("status", "DOWN");
            response.put("error", e.getMessage());
            response.put("responseTimeMs", responseTime);
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.status(503).body(response);
        }
    }
    
    /**
     * Get table row counts
     */
    @GetMapping("/database/stats")
    public ResponseEntity<Map<String, Object>> getDatabaseStats() {
        Map<String, Object> stats = new HashMap<>();
        
        try (Connection connection = dataSource.getConnection()) {
            Map<String, Integer> tableCounts = new HashMap<>();
            
            String[] tables = {"admins", "employees", "attendance", "payments", "time_off"};
            
            for (String table : tables) {
                try (var stmt = connection.createStatement();
                     var rs = stmt.executeQuery("SELECT COUNT(*) as count FROM " + table)) {
                    if (rs.next()) {
                        tableCounts.put(table, rs.getInt("count"));
                    }
                } catch (Exception e) {
                    tableCounts.put(table, -1); // Table doesn't exist or error
                }
            }
            
            stats.put("status", "SUCCESS");
            stats.put("tableCounts", tableCounts);
            stats.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            stats.put("status", "ERROR");
            stats.put("error", e.getMessage());
            stats.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.status(503).body(stats);
        }
    }
    
    /**
     * Helper method to mask password in URL
     */
    private String maskPassword(String url) {
        if (url == null) return null;
        return url.replaceAll("password=[^&;]*", "password=****");
    }
    
    /**
     * Helper method to get transaction isolation level name
     */
    private String getTransactionIsolationName(int level) {
        return switch (level) {
            case Connection.TRANSACTION_NONE -> "NONE";
            case Connection.TRANSACTION_READ_UNCOMMITTED -> "READ_UNCOMMITTED";
            case Connection.TRANSACTION_READ_COMMITTED -> "READ_COMMITTED";
            case Connection.TRANSACTION_REPEATABLE_READ -> "REPEATABLE_READ";
            case Connection.TRANSACTION_SERIALIZABLE -> "SERIALIZABLE";
            default -> "UNKNOWN";
        };
    }
}
