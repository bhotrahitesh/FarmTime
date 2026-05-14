package com.farmtime.controller;

import com.farmtime.service.DataCleanupService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {
    
    private final DataCleanupService dataCleanupService;
    
    @Value("${data.retention.months:2}")
    private int retentionMonths;
    
    @Value("${data.cleanup.cron:0 0 2 * * ?}")
    private String cleanupSchedule;
    
    /**
     * Manually trigger data cleanup
     */
    @PostMapping("/cleanup")
    public ResponseEntity<Map<String, Object>> triggerCleanup() {
        dataCleanupService.manualCleanup();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Data cleanup completed successfully");
        response.put("cutoffDate", LocalDate.now().minusMonths(retentionMonths));
        response.put("retentionMonths", retentionMonths);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get data retention configuration
     */
    @GetMapping("/cleanup/config")
    public ResponseEntity<Map<String, Object>> getCleanupConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("retentionMonths", retentionMonths);
        config.put("cleanupSchedule", cleanupSchedule);
        config.put("cutoffDate", LocalDate.now().minusMonths(retentionMonths));
        config.put("description", "Records older than " + retentionMonths + " months will be automatically deleted");
        
        return ResponseEntity.ok(config);
    }
}
