package com.farmtime.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private LocalDate attendanceDate;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private Boolean isPresent;
    private String attendanceStatus; // PRESENT, ABSENT, SICK_LEAVE, HALF_DAY, CASUAL_LEAVE, WORK_FROM_HOME
    private Double hoursWorked;
    private String notes;
}
