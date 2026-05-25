package com.farmtime.service;

import com.farmtime.dto.PaymentDTO;
import com.farmtime.exception.ValidationException;
import com.farmtime.model.Employee;
import com.farmtime.model.Payment;
import com.farmtime.model.Payment.PaymentType;
import com.farmtime.repository.EmployeeRepository;
import com.farmtime.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final EmployeeRepository employeeRepository;
    
    @Value("${salary.payday:10}")
    private Integer salaryPayday;
    
    @Transactional
    public PaymentDTO createPayment(PaymentDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
            .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        // Validate total payments don't exceed monthly salary in the cycle
        validateTotalPaymentInCycle(employee, dto.getPaymentDate(), dto.getAmount(), dto.getPaymentType(), null);
        
        Payment payment = new Payment();
        payment.setEmployee(employee);
        payment.setPaymentDate(dto.getPaymentDate());
        payment.setAmount(dto.getAmount());
        payment.setPaymentType(dto.getPaymentType());
        payment.setDescription(dto.getDescription());
        
        Payment saved = paymentRepository.save(payment);
        return convertToDTO(saved);
    }
    
    @Transactional
    public PaymentDTO updatePayment(Long id, PaymentDTO dto) {
        Payment payment = paymentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payment record not found"));
        
        // Validate total payments don't exceed monthly salary in the cycle
        validateTotalPaymentInCycle(payment.getEmployee(), dto.getPaymentDate(), dto.getAmount(), dto.getPaymentType(), id);
        
        payment.setPaymentDate(dto.getPaymentDate());
        payment.setAmount(dto.getAmount());
        payment.setPaymentType(dto.getPaymentType());
        payment.setDescription(dto.getDescription());
        
        Payment updated = paymentRepository.save(payment);
        return convertToDTO(updated);
    }
    
    @Transactional(readOnly = true)
    public List<PaymentDTO> getPaymentsByDateRange(LocalDate startDate, LocalDate endDate) {
        return paymentRepository.findByPaymentDateBetweenOrderByPaymentDateDescCreatedAtDesc(startDate, endDate).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<PaymentDTO> getPaymentsByEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        return paymentRepository.findByEmployeeOrderByPaymentDateDescCreatedAtDesc(employee).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void deletePayment(Long id) {
        paymentRepository.deleteById(id);
    }
    
    private PaymentDTO convertToDTO(Payment payment) {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(payment.getId());
        dto.setEmployeeId(payment.getEmployee().getId());
        dto.setEmployeeName(payment.getEmployee().getName());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setAmount(payment.getAmount());
        dto.setPaymentType(payment.getPaymentType());
        dto.setDescription(payment.getDescription());
        return dto;
    }
    
    /**
     * Validates that total payments (SALARY + ADVANCE + DEDUCTION) in a cycle 
     * don't exceed employee's monthly salary.
     * Note: Deductions are added to the total because they represent money already accounted for in the cycle.
     * 
     * @param employee The employee
     * @param paymentDate The payment date
     * @param amount The payment amount
     * @param paymentType The payment type
     * @param excludePaymentId Payment ID to exclude from calculation (for updates)
     * @throws RuntimeException if validation fails
     */
    private void validateTotalPaymentInCycle(Employee employee, LocalDate paymentDate, double amount, 
                                            PaymentType paymentType, Long excludePaymentId) {
        // Calculate salary cycle dates for the payment date
        LocalDate[] cycleDates = calculateCycleDatesForPayment(paymentDate);
        LocalDate cycleStart = cycleDates[0];
        LocalDate cycleEnd = cycleDates[1];
        
        // Get all payments for this employee in this cycle
        List<Payment> existingPayments = paymentRepository
            .findByEmployeeAndPaymentDateBetweenOrderByPaymentDateDescCreatedAtDesc(
                employee, cycleStart, cycleEnd
            )
            .stream()
            .filter(p -> excludePaymentId == null || !p.getId().equals(excludePaymentId))
            .collect(Collectors.toList());
        
        // Calculate totals by payment type
        double totalSalary = 0.0;
        double totalAdvance = 0.0;
        double totalDeduction = 0.0;
        
        for (Payment p : existingPayments) {
            switch (p.getPaymentType()) {
                case SALARY:
                    totalSalary += p.getAmount();
                    break;
                case ADVANCE:
                    totalAdvance += p.getAmount();
                    break;
                case DEDUCTION:
                    totalDeduction += p.getAmount();
                    break;
            }
        }
        
        // Add the new payment to respective category
        switch (paymentType) {
            case SALARY:
                totalSalary += amount;
                break;
            case ADVANCE:
                totalAdvance += amount;
                break;
            case DEDUCTION:
                totalDeduction += amount;
                break;
        }
        
        // Total paid = SALARY + ADVANCE + DEDUCTION
        // (Deduction is added because it represents money already dealt with in the cycle)
        double totalPaid = totalSalary + totalAdvance + totalDeduction;
        double remaining = employee.getMonthlySalary() - totalPaid;
        
        // Check if it exceeds monthly salary
        if (totalPaid > employee.getMonthlySalary()) {
            throw new ValidationException(
                String.format(
                    "Cannot process payment. Employee monthly salary: ₹%.2f. " +
                    "In current cycle (%s to %s): Salary paid: ₹%.2f, Advance: ₹%.2f, Deduction: ₹%.2f. " +
                    "Total: ₹%.2f. Remaining: ₹%.2f. You are trying to add ₹%.2f which exceeds the limit.",
                    employee.getMonthlySalary(),
                    cycleStart,
                    cycleEnd,
                    totalSalary,
                    totalAdvance,
                    totalDeduction,
                    totalPaid,
                    remaining,
                    amount
                )
            );
        }
    }
    
    /**
     * Calculate salary cycle dates for a given payment date.
     * Payday is the END of the cycle, next day starts new cycle.
     * 
     * @param paymentDate The payment date
     * @return Array of [cycleStart, cycleEnd]
     */
    private LocalDate[] calculateCycleDatesForPayment(LocalDate paymentDate) {
        int year = paymentDate.getYear();
        int month = paymentDate.getMonth().getValue();
        int day = paymentDate.getDayOfMonth();
        
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
}
