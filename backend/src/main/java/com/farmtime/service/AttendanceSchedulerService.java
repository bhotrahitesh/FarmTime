package com.farmtime.service;

import com.farmtime.model.Attendance;
import com.farmtime.model.Employee;
import com.farmtime.repository.AttendanceRepository;
import com.farmtime.repository.EmployeeRepository;
import com.farmtime.repository.TimeOffRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceSchedulerService {
    
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final TimeOffRepository timeOffRepository;
    
    @Value("${attendance.auto.mark.enabled:true}")
    private boolean autoMarkEnabled;
    
    @Scheduled(cron = "${attendance.auto.mark.cron:0 0 7 * * *}", zone = "${attendance.auto.mark.timezone:Asia/Kolkata}")
    @Transactional
    public void autoMarkAttendance() {
        if (!autoMarkEnabled) {
            log.debug("Auto-attendance marking is disabled");
            return;
        }
        log.info("Starting automatic attendance marking at 7 AM");
        
        LocalDate today = LocalDate.now();
        List<Employee> activeEmployees = employeeRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        
        int markedCount = 0;
        int skippedCount = 0;
        int onLeaveCount = 0;
        
        for (Employee employee : activeEmployees) {
            boolean alreadyMarked = attendanceRepository
                .findByEmployeeAndAttendanceDate(employee, today)
                .isPresent();
            
            if (alreadyMarked) {
                skippedCount++;
                log.debug("Skipped employee {} - attendance already marked", employee.getName());
                continue;
            }
            
            // Check if employee has leave on this date
            boolean hasLeave = timeOffRepository.hasLeaveOnDate(employee, today);
            
            if (hasLeave) {
                onLeaveCount++;
                log.debug("Skipped employee {} - on leave today", employee.getName());
                continue;
            }
            
            // Mark attendance for employee
            Attendance attendance = new Attendance();
            attendance.setEmployee(employee);
            attendance.setAttendanceDate(today);
            attendance.setCheckInTime(LocalTime.of(8, 0));
            attendance.setCheckOutTime(LocalTime.of(23, 59));
            attendance.setIsPresent(true);
            attendance.setAttendanceStatus("PRESENT");
            attendance.setNotes("Auto-marked by system");
            
            attendanceRepository.save(attendance);
            markedCount++;
            log.debug("Auto-marked attendance for employee: {}", employee.getName());
        }
        
        log.info("Automatic attendance marking completed. Marked: {}, Already Marked: {}, On Leave: {}, Total Active Employees: {}", 
                 markedCount, skippedCount, onLeaveCount, activeEmployees.size());
    }
    
    @Transactional
    public String manualAutoMarkAttendance() {
        log.info("Manual trigger for automatic attendance marking");
        
        LocalDate today = LocalDate.now();
        List<Employee> activeEmployees = employeeRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        
        int markedCount = 0;
        int skippedCount = 0;
        int onLeaveCount = 0;
        
        for (Employee employee : activeEmployees) {
            boolean alreadyMarked = attendanceRepository
                .findByEmployeeAndAttendanceDate(employee, today)
                .isPresent();
            
            if (alreadyMarked) {
                skippedCount++;
                continue;
            }
            
            // Check if employee has leave on this date
            boolean hasLeave = timeOffRepository.hasLeaveOnDate(employee, today);
            
            if (hasLeave) {
                onLeaveCount++;
                continue;
            }
            
            // Mark attendance for employee
            Attendance attendance = new Attendance();
            attendance.setEmployee(employee);
            attendance.setAttendanceDate(today);
            attendance.setCheckInTime(LocalTime.of(8, 0));
            attendance.setCheckOutTime(LocalTime.of(23, 59));
            attendance.setIsPresent(true);
            attendance.setAttendanceStatus("PRESENT");
            attendance.setNotes("Auto-marked by system (manual trigger)");
            
            attendanceRepository.save(attendance);
            markedCount++;
        }
        
        String result = String.format("Manual auto-attendance completed. Marked: %d, Already Marked: %d, On Leave: %d, Total Active Employees: %d", 
                                      markedCount, skippedCount, onLeaveCount, activeEmployees.size());
        log.info(result);
        return result;
    }
}
