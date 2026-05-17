package com.farmtime.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalaryCycleSummaryDTO {
    private Long employeeId;
    private String employeeName;
    private Double monthlySalary;
    private Integer salaryPayday;
    private LocalDate cycleStartDate;
    private LocalDate cycleEndDate;
    private Double totalPaid;
    private Double totalAdvance;
    private Double totalBonus;
    private Double totalDeduction;
    private Double remainingAmount;
    private Double netPayable;
}
