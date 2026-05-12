package com.farmtime.service;

import com.farmtime.dto.TimeOffDTO;
import com.farmtime.model.Employee;
import com.farmtime.model.TimeOff;
import com.farmtime.repository.EmployeeRepository;
import com.farmtime.repository.TimeOffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimeOffService {
    
    private final TimeOffRepository timeOffRepository;
    private final EmployeeRepository employeeRepository;
    
    @Transactional
    public TimeOffDTO createTimeOff(TimeOffDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
            .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        TimeOff timeOff = new TimeOff();
        timeOff.setEmployee(employee);
        timeOff.setStartDate(dto.getStartDate());
        timeOff.setEndDate(dto.getEndDate());
        timeOff.setTimeOffType(dto.getTimeOffType());
        timeOff.setReason(dto.getReason());
        
        TimeOff saved = timeOffRepository.save(timeOff);
        return convertToDTO(saved);
    }
    
    @Transactional
    public TimeOffDTO updateTimeOff(Long id, TimeOffDTO dto) {
        TimeOff timeOff = timeOffRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Time off record not found"));
        
        timeOff.setStartDate(dto.getStartDate());
        timeOff.setEndDate(dto.getEndDate());
        timeOff.setTimeOffType(dto.getTimeOffType());
        timeOff.setReason(dto.getReason());
        
        TimeOff updated = timeOffRepository.save(timeOff);
        return convertToDTO(updated);
    }
    
    @Transactional(readOnly = true)
    public List<TimeOffDTO> getTimeOffByEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        return timeOffRepository.findByEmployee(employee).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<TimeOffDTO> getTimeOffByDateRange(LocalDate startDate, LocalDate endDate) {
        return timeOffRepository.findByStartDateBetweenOrEndDateBetween(startDate, endDate, startDate, endDate).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void deleteTimeOff(Long id) {
        timeOffRepository.deleteById(id);
    }
    
    private TimeOffDTO convertToDTO(TimeOff timeOff) {
        TimeOffDTO dto = new TimeOffDTO();
        dto.setId(timeOff.getId());
        dto.setEmployeeId(timeOff.getEmployee().getId());
        dto.setEmployeeName(timeOff.getEmployee().getName());
        dto.setStartDate(timeOff.getStartDate());
        dto.setEndDate(timeOff.getEndDate());
        dto.setTimeOffType(timeOff.getTimeOffType());
        dto.setReason(timeOff.getReason());
        return dto;
    }
}
