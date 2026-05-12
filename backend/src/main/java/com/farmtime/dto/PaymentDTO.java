package com.farmtime.dto;

import com.farmtime.model.Payment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private LocalDate paymentDate;
    private Double amount;
    private Payment.PaymentType paymentType;
    private String description;
}
