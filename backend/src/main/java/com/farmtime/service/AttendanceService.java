package com.farmtime.service;

import com.farmtime.dto.AttendanceDTO;
import com.farmtime.exception.DuplicateResourceException;
import com.farmtime.exception.ResourceNotFoundException;
import com.farmtime.exception.ValidationException;
import com.farmtime.model.Attendance;
import com.farmtime.model.Employee;
import com.farmtime.repository.AttendanceRepository;
import com.farmtime.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    
    @Transactional
    public AttendanceDTO markAttendance(AttendanceDTO dto) {
        // Validate input
        if (dto.getEmployeeId() == null) {
            throw new ValidationException("Employee is required");
        }
        
        if (dto.getAttendanceDate() == null) {
            throw new ValidationException("Attendance date is required");
        }
        
        if (dto.getAttendanceDate().isAfter(LocalDate.now())) {
            throw new ValidationException("Cannot mark attendance for future dates");
        }
        
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + dto.getEmployeeId()));
        
        // Check if attendance date is before employee's joining date
        if (dto.getAttendanceDate().isBefore(employee.getJoiningDate())) {
            throw new ValidationException(
                "Cannot mark attendance for " + employee.getName() + " before their joining date (" + 
                employee.getJoiningDate() + "). Employee has not joined yet on " + dto.getAttendanceDate() + "."
            );
        }
        
        // Check if attendance already exists for this date
        attendanceRepository.findByEmployeeAndAttendanceDate(employee, dto.getAttendanceDate())
            .ifPresent(a -> {
                throw new DuplicateResourceException(
                    "Attendance for " + employee.getName() + " has already been marked for " + 
                    dto.getAttendanceDate() + "."
                );
            });
        
        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setAttendanceDate(dto.getAttendanceDate());
        attendance.setCheckInTime(dto.getCheckInTime());
        attendance.setCheckOutTime(dto.getCheckOutTime());
        attendance.setIsPresent(dto.getIsPresent());
        attendance.setAttendanceStatus(dto.getAttendanceStatus());
        attendance.setHoursWorked(dto.getHoursWorked());
        attendance.setNotes(dto.getNotes());
        
        Attendance saved = attendanceRepository.save(attendance);
        return convertToDTO(saved);
    }
    
    @Transactional
    public AttendanceDTO updateAttendance(Long id, AttendanceDTO dto) {
        Attendance attendance = attendanceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with ID: " + id));
        
        attendance.setCheckInTime(dto.getCheckInTime());
        attendance.setCheckOutTime(dto.getCheckOutTime());
        attendance.setIsPresent(dto.getIsPresent());
        attendance.setAttendanceStatus(dto.getAttendanceStatus());
        attendance.setHoursWorked(dto.getHoursWorked());
        attendance.setNotes(dto.getNotes());
        
        Attendance updated = attendanceRepository.save(attendance);
        return convertToDTO(updated);
    }
    
    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAttendanceByDateRange(LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByAttendanceDateBetweenOrderByAttendanceDateDescCreatedAtDesc(startDate, endDate).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAttendanceByEmployee(Long employeeId, LocalDate startDate, LocalDate endDate) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));
        
        return attendanceRepository.findByEmployeeAndAttendanceDateBetweenOrderByAttendanceDateDescCreatedAtDesc(employee, startDate, endDate).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void deleteAttendance(Long id) {
        attendanceRepository.deleteById(id);
    }
    
    private AttendanceDTO convertToDTO(Attendance attendance) {
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(attendance.getId());
        dto.setEmployeeId(attendance.getEmployee().getId());
        dto.setEmployeeName(attendance.getEmployee().getName());
        dto.setAttendanceDate(attendance.getAttendanceDate());
        dto.setCheckInTime(attendance.getCheckInTime());
        dto.setCheckOutTime(attendance.getCheckOutTime());
        dto.setIsPresent(attendance.getIsPresent());
        dto.setAttendanceStatus(attendance.getAttendanceStatus());
        dto.setHoursWorked(attendance.getHoursWorked());
        dto.setNotes(attendance.getNotes());
        return dto;
    }
}
