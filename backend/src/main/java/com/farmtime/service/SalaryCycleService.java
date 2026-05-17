package com.farmtime.service;

import com.farmtime.dto.SalaryCycleSummaryDTO;
import com.farmtime.model.Employee;
import com.farmtime.model.Payment;
import com.farmtime.repository.EmployeeRepository;
import com.farmtime.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SalaryCycleService {
    
    private final EmployeeRepository employeeRepository;
    private final PaymentRepository paymentRepository;
    
    @Value("${salary.payday:1}")
    private Integer globalSalaryPayday;
    
    @Transactional(readOnly = true)
    public SalaryCycleSummaryDTO getSalaryCycleSummary(Long employeeId, LocalDate referenceDate) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));

        LocalDate[] cycleDates = calculateCycleDates(globalSalaryPayday, referenceDate);
        LocalDate cycleStart = cycleDates[0];
        LocalDate cycleEnd = cycleDates[1];

        return calculateSummary(employee, cycleStart, cycleEnd);
    }

    @Transactional(readOnly = true)
    public SalaryCycleSummaryDTO getCurrentSalaryCycleSummary(Long employeeId) {
        return getSalaryCycleSummary(employeeId, LocalDate.now());
    }

    @Transactional(readOnly = true)
    public List<SalaryCycleSummaryDTO> getAllEmployeesCurrentCycleSummary() {
        try {
            log.info("Getting salary cycle summary for all employees. Global payday: {}", globalSalaryPayday);
            List<Employee> activeEmployees = employeeRepository.findByIsActiveTrueOrderByCreatedAtDesc();
            log.info("Found {} active employees", activeEmployees.size());
            List<SalaryCycleSummaryDTO> summaries = new ArrayList<>();

            for (Employee employee : activeEmployees) {
                try {
                    LocalDate[] cycleDates = calculateCycleDates(globalSalaryPayday, LocalDate.now());
                    log.debug("Employee {}: Cycle {} to {}", employee.getName(), cycleDates[0], cycleDates[1]);
                    SalaryCycleSummaryDTO summary = calculateSummary(employee, cycleDates[0], cycleDates[1]);
                    summaries.add(summary);
                } catch (Exception e) {
                    log.error("Error calculating summary for employee {}: {}", employee.getName(), e.getMessage(), e);
                }
            }

            log.info("Successfully generated {} salary cycle summaries", summaries.size());
            return summaries;
        } catch (Exception e) {
            log.error("Error in getAllEmployeesCurrentCycleSummary: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    private LocalDate[] calculateCycleDates(Integer salaryPayday, LocalDate referenceDate) {
        int year = referenceDate.getYear();
        int month = referenceDate.getMonth().getValue();
        int day = referenceDate.getDayOfMonth();
        
        LocalDate cycleStart;
        LocalDate cycleEnd;
        
        if (day >= salaryPayday) {
            cycleStart = LocalDate.of(year, month, salaryPayday);
            
            YearMonth nextMonth = YearMonth.of(year, month).plusMonths(1);
            int nextMonthPayday = Math.min(salaryPayday, nextMonth.lengthOfMonth());
            cycleEnd = LocalDate.of(nextMonth.getYear(), nextMonth.getMonthValue(), nextMonthPayday).minusDays(1);
        } else {
            YearMonth prevMonth = YearMonth.of(year, month).minusMonths(1);
            int prevMonthPayday = Math.min(salaryPayday, prevMonth.lengthOfMonth());
            cycleStart = LocalDate.of(prevMonth.getYear(), prevMonth.getMonthValue(), prevMonthPayday);
            
            cycleEnd = LocalDate.of(year, month, salaryPayday).minusDays(1);
        }
        
        return new LocalDate[]{cycleStart, cycleEnd};
    }
    
    private SalaryCycleSummaryDTO calculateSummary(Employee employee, LocalDate cycleStart, LocalDate cycleEnd) {
        List<Payment> payments = paymentRepository.findByEmployeeAndPaymentDateBetween(
            employee, cycleStart, cycleEnd
        );
        
        double totalPaid = 0.0;
        double totalAdvance = 0.0;
        double totalBonus = 0.0;
        double totalDeduction = 0.0;
        
        for (Payment payment : payments) {
            switch (payment.getPaymentType()) {
                case SALARY:
                    totalPaid += payment.getAmount();
                    break;
                case ADVANCE:
                    totalAdvance += payment.getAmount();
                    totalPaid += payment.getAmount();
                    break;
                case BONUS:
                    totalBonus += payment.getAmount();
                    totalPaid += payment.getAmount();
                    break;
                case DEDUCTION:
                    totalDeduction += payment.getAmount();
                    totalPaid -= payment.getAmount();
                    break;
            }
        }
        
        double netPayable = employee.getMonthlySalary() + totalBonus - totalDeduction;
        double remainingAmount = netPayable - totalPaid;
        
        SalaryCycleSummaryDTO summary = new SalaryCycleSummaryDTO();
        summary.setEmployeeId(employee.getId());
        summary.setEmployeeName(employee.getName());
        summary.setMonthlySalary(employee.getMonthlySalary());
        summary.setSalaryPayday(globalSalaryPayday);
        summary.setCycleStartDate(cycleStart);
        summary.setCycleEndDate(cycleEnd);
        summary.setTotalPaid(totalPaid);
        summary.setTotalAdvance(totalAdvance);
        summary.setTotalBonus(totalBonus);
        summary.setTotalDeduction(totalDeduction);
        summary.setRemainingAmount(remainingAmount);
        summary.setNetPayable(netPayable);
        
        return summary;
    }
}
