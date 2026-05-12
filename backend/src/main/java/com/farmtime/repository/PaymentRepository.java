package com.farmtime.repository;

import com.farmtime.model.Employee;
import com.farmtime.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByEmployeeAndPaymentDateBetween(Employee employee, LocalDate startDate, LocalDate endDate);
    List<Payment> findByPaymentDateBetween(LocalDate startDate, LocalDate endDate);
    List<Payment> findByEmployee(Employee employee);
    
    @Modifying
    @Query("DELETE FROM Payment p WHERE p.paymentDate < :cutoffDate")
    void deleteOldRecords(@Param("cutoffDate") LocalDate cutoffDate);
}
