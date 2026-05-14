package com.farmtime.service;

import com.farmtime.dto.EmployeeDTO;
import com.farmtime.exception.DuplicateResourceException;
import com.farmtime.exception.ResourceNotFoundException;
import com.farmtime.exception.ValidationException;
import com.farmtime.model.Employee;
import com.farmtime.repository.AttendanceRepository;
import com.farmtime.repository.EmployeeRepository;
import com.farmtime.repository.PaymentRepository;
import com.farmtime.repository.TimeOffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final PaymentRepository paymentRepository;
    private final TimeOffRepository timeOffRepository;
    
    @Transactional
    public EmployeeDTO createEmployee(EmployeeDTO dto) {
        // Validate input
        validateEmployee(dto);
        
        // Check for duplicate phone number
        if (dto.getPhoneNumber() != null && !dto.getPhoneNumber().trim().isEmpty()) {
            employeeRepository.findByPhoneNumber(dto.getPhoneNumber())
                .ifPresent(e -> {
                    throw new DuplicateResourceException(
                        "This mobile number is already registered with employee: " + e.getName()
                    );
                });
        }
        
        Employee employee = new Employee();
        employee.setName(dto.getName());
        employee.setPhoneNumber(dto.getPhoneNumber());
        employee.setAddress(dto.getAddress());
        employee.setJoiningDate(dto.getJoiningDate());
        employee.setMonthlySalary(dto.getMonthlySalary());
        employee.setIsActive(true);
        
        Employee saved = employeeRepository.save(employee);
        return convertToDTO(saved);
    }
    
    @Transactional
    public EmployeeDTO updateEmployee(Long id, EmployeeDTO dto) {
        Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));
        
        // Validate input
        validateEmployee(dto);
        
        // Check for duplicate phone number (excluding current employee)
        if (dto.getPhoneNumber() != null && !dto.getPhoneNumber().trim().isEmpty()) {
            employeeRepository.findByPhoneNumber(dto.getPhoneNumber())
                .ifPresent(e -> {
                    if (!e.getId().equals(id)) {
                        throw new DuplicateResourceException(
                            "This mobile number is already registered with employee: " + e.getName()
                        );
                    }
                });
        }
        
        employee.setName(dto.getName());
        employee.setPhoneNumber(dto.getPhoneNumber());
        employee.setAddress(dto.getAddress());
        employee.setJoiningDate(dto.getJoiningDate());
        employee.setMonthlySalary(dto.getMonthlySalary());
        employee.setIsActive(dto.getIsActive());
        
        Employee updated = employeeRepository.save(employee);
        return convertToDTO(updated);
    }
    
    @Transactional(readOnly = true)
    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<EmployeeDTO> getActiveEmployees() {
        return employeeRepository.findByIsActiveTrueOrderByCreatedAtDesc().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public EmployeeDTO getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));
        return convertToDTO(employee);
    }
    
    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + id));
        
        // Delete all related records first (cascade delete)
        deleteEmployeeRelatedRecords(employee);
        
        // Then delete the employee
        employeeRepository.delete(employee);
    }
    
    private void deleteEmployeeRelatedRecords(Employee employee) {
        // Delete all attendance records
        List<com.farmtime.model.Attendance> attendanceRecords = attendanceRepository.findByEmployeeAndAttendanceDateBetweenOrderByAttendanceDateDescCreatedAtDesc(
            employee, 
            java.time.LocalDate.of(2000, 1, 1), 
            java.time.LocalDate.now().plusYears(10)
        );
        if (!attendanceRecords.isEmpty()) {
            attendanceRepository.deleteAll(attendanceRecords);
        }
        
        // Delete all payment records
        List<com.farmtime.model.Payment> paymentRecords = paymentRepository.findByEmployeeAndPaymentDateBetweenOrderByPaymentDateDescCreatedAtDesc(
            employee, 
            java.time.LocalDate.of(2000, 1, 1), 
            java.time.LocalDate.now().plusYears(10)
        );
        if (!paymentRecords.isEmpty()) {
            paymentRepository.deleteAll(paymentRecords);
        }
        
        // Delete all time-off records
        List<com.farmtime.model.TimeOff> timeOffRecords = timeOffRepository.findByEmployeeAndStartDateBetween(
            employee, 
            java.time.LocalDate.of(2000, 1, 1), 
            java.time.LocalDate.now().plusYears(10)
        );
        if (!timeOffRecords.isEmpty()) {
            timeOffRepository.deleteAll(timeOffRecords);
        }
    }
    
    private void validateEmployee(EmployeeDTO dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new ValidationException("Employee name is required");
        }
        
        if (dto.getPhoneNumber() == null || dto.getPhoneNumber().trim().isEmpty()) {
            throw new ValidationException("Mobile number is required");
        }
        
        if (dto.getPhoneNumber().length() < 10) {
            throw new ValidationException("Mobile number must be at least 10 digits");
        }
        
        if (dto.getMonthlySalary() != null && dto.getMonthlySalary() < 0) {
            throw new ValidationException("Monthly salary cannot be negative");
        }
        
        if (dto.getJoiningDate() == null) {
            throw new ValidationException("Joining date is required");
        }
    }
    
    private EmployeeDTO convertToDTO(Employee employee) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(employee.getId());
        dto.setName(employee.getName());
        dto.setPhoneNumber(employee.getPhoneNumber());
        dto.setAddress(employee.getAddress());
        dto.setJoiningDate(employee.getJoiningDate());
        dto.setMonthlySalary(employee.getMonthlySalary());
        dto.setIsActive(employee.getIsActive());
        return dto;
    }
}
