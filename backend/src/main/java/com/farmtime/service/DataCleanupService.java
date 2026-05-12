package com.farmtime.service;

import com.farmtime.repository.AttendanceRepository;
import com.farmtime.repository.PaymentRepository;
import com.farmtime.repository.TimeOffRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataCleanupService {
    
    private final AttendanceRepository attendanceRepository;
    private final PaymentRepository paymentRepository;
    private final TimeOffRepository timeOffRepository;
    
    /**
     * Runs daily at 2 AM to delete records older than 2 months
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupOldData() {
        log.info("Starting scheduled data cleanup...");
        
        LocalDate cutoffDate = LocalDate.now().minusMonths(2);
        
        try {
            // Delete old attendance records
            attendanceRepository.deleteOldRecords(cutoffDate);
            log.info("Deleted attendance records older than {}", cutoffDate);
            
            // Delete old payment records
            paymentRepository.deleteOldRecords(cutoffDate);
            log.info("Deleted payment records older than {}", cutoffDate);
            
            // Delete old time off records
            timeOffRepository.deleteOldRecords(cutoffDate);
            log.info("Deleted time off records older than {}", cutoffDate);
            
            log.info("Data cleanup completed successfully");
        } catch (Exception e) {
            log.error("Error during data cleanup", e);
        }
    }
    
    /**
     * Manual cleanup method that can be called via API
     */
    @Transactional
    public void manualCleanup() {
        log.info("Starting manual data cleanup...");
        cleanupOldData();
    }
}
