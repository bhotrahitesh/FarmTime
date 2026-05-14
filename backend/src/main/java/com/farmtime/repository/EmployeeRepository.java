package com.farmtime.repository;

import com.farmtime.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByIsActiveTrueOrderByCreatedAtDesc();
    Optional<Employee> findByPhoneNumber(String phoneNumber);
}
