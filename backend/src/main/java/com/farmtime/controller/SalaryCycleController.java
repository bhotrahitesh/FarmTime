package com.farmtime.controller;

import com.farmtime.dto.SalaryCycleSummaryDTO;
import com.farmtime.service.SalaryCycleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/salary-cycle")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class SalaryCycleController {
    
    private final SalaryCycleService salaryCycleService;
    
    @GetMapping("/employee/{employeeId}/current")
    public ResponseEntity<SalaryCycleSummaryDTO> getCurrentCycleSummary(@PathVariable Long employeeId) {
        try {
            log.info("Getting current salary cycle summary for employee: {}", employeeId);
            SalaryCycleSummaryDTO summary = salaryCycleService.getCurrentSalaryCycleSummary(employeeId);
            log.info("Returning summary - Employee: {}, Monthly: {}, Deduction: {}, TotalPaid: {}, Remaining: {}", 
                     summary.getEmployeeName(), summary.getMonthlySalary(), 
                     summary.getTotalDeduction(), summary.getTotalPaid(), summary.getRemainingAmount());
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Error getting current cycle summary for employee {}: {}", employeeId, e.getMessage(), e);
            throw e;
        }
    }
    
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<SalaryCycleSummaryDTO> getCycleSummary(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate referenceDate) {
        try {
            log.info("Getting salary cycle summary for employee: {} on date: {}", employeeId, referenceDate);
            SalaryCycleSummaryDTO summary = salaryCycleService.getSalaryCycleSummary(employeeId, referenceDate);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Error getting cycle summary for employee {} on {}: {}", employeeId, referenceDate, e.getMessage(), e);
            throw e;
        }
    }
    
    @GetMapping("/all-employees/current")
    public ResponseEntity<List<SalaryCycleSummaryDTO>> getAllEmployeesCurrentCycleSummary() {
        try {
            log.info("Getting salary cycle summary for all employees");
            List<SalaryCycleSummaryDTO> summaries = salaryCycleService.getAllEmployeesCurrentCycleSummary();
            log.info("Successfully retrieved {} salary cycle summaries", summaries.size());
            return ResponseEntity.ok(summaries);
        } catch (Exception e) {
            log.error("Error getting all employees cycle summary: {}", e.getMessage(), e);
            throw e;
        }
    }
}
