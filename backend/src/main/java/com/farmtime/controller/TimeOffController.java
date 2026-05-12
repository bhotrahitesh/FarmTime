package com.farmtime.controller;

import com.farmtime.dto.TimeOffDTO;
import com.farmtime.service.TimeOffService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/timeoff")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TimeOffController {
    
    private final TimeOffService timeOffService;
    
    @PostMapping
    public ResponseEntity<TimeOffDTO> createTimeOff(@RequestBody TimeOffDTO timeOffDTO) {
        TimeOffDTO created = timeOffService.createTimeOff(timeOffDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TimeOffDTO> updateTimeOff(@PathVariable Long id, @RequestBody TimeOffDTO timeOffDTO) {
        TimeOffDTO updated = timeOffService.updateTimeOff(id, timeOffDTO);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<TimeOffDTO>> getTimeOffByEmployee(@PathVariable Long employeeId) {
        List<TimeOffDTO> timeOffs = timeOffService.getTimeOffByEmployee(employeeId);
        return ResponseEntity.ok(timeOffs);
    }
    
    @GetMapping
    public ResponseEntity<List<TimeOffDTO>> getTimeOffByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<TimeOffDTO> timeOffs = timeOffService.getTimeOffByDateRange(startDate, endDate);
        return ResponseEntity.ok(timeOffs);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTimeOff(@PathVariable Long id) {
        timeOffService.deleteTimeOff(id);
        return ResponseEntity.noContent().build();
    }
}
