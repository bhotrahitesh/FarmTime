package com.farmtime.service;

import com.farmtime.dto.PaymentDTO;
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
     * Validates that total payments (SALARY + ADVANCE + BONUS - DEDUCTION) in a cycle 
     * don't exceed employee's monthly salary.
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
        
        // Calculate total existing payments (SALARY + ADVANCE + BONUS - DEDUCTION)
        double totalExistingPayments = 0.0;
        for (Payment p : existingPayments) {
            if (p.getPaymentType() == PaymentType.DEDUCTION) {
                totalExistingPayments -= p.getAmount();
            } else {
                totalExistingPayments += p.getAmount();
            }
        }
        
        // Calculate total if we add this payment
        double newPaymentAmount = (paymentType == PaymentType.DEDUCTION) ? -amount : amount;
        double totalPaymentsAfter = totalExistingPayments + newPaymentAmount;
        
        // Check if it exceeds monthly salary
        if (totalPaymentsAfter > employee.getMonthlySalary()) {
            throw new RuntimeException(
                "You cannot pay more than the employee salary for the month. " +
                String.format(
                    "Employee monthly salary: ₹%.2f, Total payments in cycle (%s to %s) would be: ₹%.2f",
                    employee.getMonthlySalary(),
                    cycleStart,
                    cycleEnd,
                    totalPaymentsAfter
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
