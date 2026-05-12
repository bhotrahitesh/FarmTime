package com.farmtime.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDTO {
    private Long id;
    private String name;
    private String phoneNumber;
    private String address;
    private LocalDate joiningDate;
    private Double monthlySalary;
    private Boolean isActive;
}
