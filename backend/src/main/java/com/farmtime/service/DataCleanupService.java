package com.farmtime.service;

import com.farmtime.repository.AttendanceRepository;
import com.farmtime.repository.PaymentRepository;
import com.farmtime.repository.TimeOffRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataCleanupService {
    
    private final AttendanceRepository attendanceRepository;
    private final PaymentRepository paymentRepository;
    private final TimeOffRepository timeOffRepository;
    
    @Value("${data.retention.minutes:15}")
    private int retentionMinutes;
    
    @Value("${salary.payday:10}")
    private Integer salaryPayday;
    
    /**
     * Runs at configured interval to delete records older than configured retention period
     * Schedule can be configured via data.cleanup.cron property
     * 
     * IMPORTANT: 
     * - Payment cleanup respects salary cycle boundaries to prevent data corruption
     * - Payment cleanup NEVER runs on payday to avoid interfering with salary processing
     */
    @Scheduled(cron = "${data.cleanup.cron:0 */15 * * * ?}")
    @Transactional
    public void cleanupOldData() {
        log.info("Starting scheduled data cleanup (retention period: {} minutes)...", retentionMinutes);
        
        LocalDateTime cutoffDateTime = LocalDateTime.now().minusMinutes(retentionMinutes);
        LocalDate cutoffDate = cutoffDateTime.toLocalDate();
        LocalDate today = LocalDate.now();
        
        try {
            // Delete old attendance records (simple date-based cleanup)
            attendanceRepository.deleteOldRecords(cutoffDate);
            log.info("Deleted attendance records older than {}", cutoffDate);
            
            // CRITICAL SAFETY CHECK: Never delete payment data on payday
            if (isPayday(today)) {
                log.warn("SKIPPING payment cleanup - Today is PAYDAY ({}). Payment data will not be deleted on payday for safety.", today);
            } else {
                // Delete old payment records (CYCLE-AWARE cleanup to prevent partial cycle deletion)
                LocalDate paymentCutoffDate = calculateSafeCycleEndDateForCleanup(cutoffDate);
                if (paymentCutoffDate != null) {
                    paymentRepository.deleteOldRecords(paymentCutoffDate);
                    log.info("Deleted payment records older than {} (cycle-safe date)", paymentCutoffDate);
                } else {
                    log.info("No complete salary cycles old enough for payment cleanup");
                }
            }
            
            // Delete old time off records (simple date-based cleanup)
            timeOffRepository.deleteOldRecords(cutoffDate);
            log.info("Deleted time off records older than {}", cutoffDate);
            
            log.info("Data cleanup completed successfully");
        } catch (Exception e) {
            log.error("Error during data cleanup", e);
        }
    }
    
    /**
     * Check if today is payday.
     * Payday is the configured day of the month (e.g., 10th).
     * 
     * @param date The date to check
     * @return true if today is payday, false otherwise
     */
    private boolean isPayday(LocalDate date) {
        int today = date.getDayOfMonth();
        int monthLength = YearMonth.of(date.getYear(), date.getMonth()).lengthOfMonth();
        
        // Handle edge case: if payday is 31 but month has fewer days
        int effectivePayday = Math.min(salaryPayday, monthLength);
        
        return today == effectivePayday;
    }
    
    /**
     * Calculates a safe cutoff date for payment cleanup that respects salary cycle boundaries.
     * Only returns a date if there are COMPLETE salary cycles that can be safely deleted.
     * 
     * Example: If retention is 2 months and today is 24-May:
     * - Simple cutoff would be 24-Mar
     * - But salary cycle might be 11-Mar to 10-Apr
     * - We should only delete cycles that ENDED before 24-Mar
     * - So we find the last complete cycle that ended before 24-Mar
     * 
     * @param simpleCutoffDate The simple date-based cutoff
     * @return Safe cutoff date (end of last complete cycle before cutoff), or null if no complete cycles
     */
    private LocalDate calculateSafeCycleEndDateForCleanup(LocalDate simpleCutoffDate) {
        // Find which cycle the cutoff date falls into
        LocalDate[] currentCycleDates = calculateCycleDatesForDate(simpleCutoffDate);
        LocalDate currentCycleStart = currentCycleDates[0];
        LocalDate currentCycleEnd = currentCycleDates[1];
        
        // If the simple cutoff is BEFORE the current cycle ends, we need to go back one more cycle
        // to ensure we only delete COMPLETE cycles
        if (simpleCutoffDate.isBefore(currentCycleEnd)) {
            // Go back one cycle - find the cycle that ended just before current cycle started
            LocalDate previousCycleEndDate = currentCycleStart.minusDays(1);
            
            // Only return this date if it's actually in the past (safety check)
            if (previousCycleEndDate.isBefore(LocalDate.now())) {
                log.info("Payment cleanup: Simple cutoff={}, Current cycle={} to {}, Safe cutoff={} (previous cycle end)", 
                    simpleCutoffDate, currentCycleStart, currentCycleEnd, previousCycleEndDate);
                return previousCycleEndDate;
            }
        } else {
            // The cutoff is after or on the cycle end, so we can safely delete up to this cycle end
            log.info("Payment cleanup: Simple cutoff={}, Current cycle={} to {}, Safe cutoff={} (current cycle end)", 
                simpleCutoffDate, currentCycleStart, currentCycleEnd, currentCycleEnd);
            return currentCycleEnd;
        }
        
        return null; // No safe date found
    }
    
    /**
     * Calculate salary cycle dates for a given date.
     * Payday is the END of the cycle, next day starts new cycle.
     * 
     * @param referenceDate The date to find the cycle for
     * @return Array of [cycleStart, cycleEnd]
     */
    private LocalDate[] calculateCycleDatesForDate(LocalDate referenceDate) {
        int year = referenceDate.getYear();
        int month = referenceDate.getMonth().getValue();
        int day = referenceDate.getDayOfMonth();
        
        LocalDate cycleStart;
        LocalDate cycleEnd;
        
        // Payday is the END of the cycle, next day starts new cycle
        if (day > salaryPayday) {
            // We are after payday, so current cycle started day after last month's payday
            YearMonth currentMonth = YearMonth.of(year, month);
            int currentMonthPayday = Math.min(salaryPayday, currentMonth.lengthOfMonth());
            cycleStart = LocalDate.of(year, month, currentMonthPayday).plusDays(1);
            
            YearMonth nextMonth = currentMonth.plusMonths(1);
            int nextMonthPayday = Math.min(salaryPayday, nextMonth.lengthOfMonth());
            cycleEnd = LocalDate.of(nextMonth.getYear(), nextMonth.getMonthValue(), nextMonthPayday);
        } else {
            // We are before or on payday, so current cycle started day after prev month's payday
            YearMonth prevMonth = YearMonth.of(year, month).minusMonths(1);
            int prevMonthPayday = Math.min(salaryPayday, prevMonth.lengthOfMonth());
            cycleStart = LocalDate.of(prevMonth.getYear(), prevMonth.getMonthValue(), prevMonthPayday).plusDays(1);
            
            YearMonth currentMonth = YearMonth.of(year, month);
            int currentMonthPayday = Math.min(salaryPayday, currentMonth.lengthOfMonth());
            cycleEnd = LocalDate.of(year, month, currentMonthPayday);
        }
        
        return new LocalDate[]{cycleStart, cycleEnd};
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
