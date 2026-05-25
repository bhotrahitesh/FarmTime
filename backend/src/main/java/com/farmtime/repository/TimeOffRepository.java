package com.farmtime.repository;

import com.farmtime.model.Employee;
import com.farmtime.model.TimeOff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimeOffRepository extends JpaRepository<TimeOff, Long> {
    List<TimeOff> findByEmployeeOrderByStartDateDescCreatedAtDesc(Employee employee);
    List<TimeOff> findByEmployeeAndStartDateBetween(Employee employee, LocalDate startDate, LocalDate endDate);
    List<TimeOff> findByStartDateBetweenOrEndDateBetweenOrderByStartDateDesc(LocalDate start1, LocalDate end1, LocalDate start2, LocalDate end2);
    
    @Query("SELECT COUNT(t) FROM TimeOff t WHERE t.employee.id = :employeeId AND t.startDate <= :endDate AND t.endDate >= :startDate")
    long countOverlappingTimeOff(@Param("employeeId") Long employeeId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(t) FROM TimeOff t WHERE t.employee.id = :employeeId AND t.startDate <= :endDate AND t.endDate >= :startDate AND t.id != :excludeId")
    long countOverlappingTimeOffExcluding(@Param("employeeId") Long employeeId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, @Param("excludeId") Long excludeId);

    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM TimeOff t WHERE t.employee = :employee AND :date BETWEEN t.startDate AND t.endDate")
    boolean hasLeaveOnDate(@Param("employee") Employee employee, @Param("date") LocalDate date);

    @Modifying
    @Query("DELETE FROM TimeOff t WHERE t.endDate < :cutoffDate")
    void deleteOldRecords(@Param("cutoffDate") LocalDate cutoffDate);
}
