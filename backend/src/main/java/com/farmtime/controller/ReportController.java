package com.farmtime.controller;

import com.farmtime.service.ExcelExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportController {
    
    private final ExcelExportService excelExportService;
    private static final DateTimeFormatter FILE_DATE_FORMATTER = DateTimeFormatter.ofPattern("ddMMyyyy");
    
    @GetMapping("/attendance/export")
    public ResponseEntity<byte[]> exportAttendanceReport(
            @RequestParam(required = false) List<Long> employeeIds,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) throws IOException {
        
        byte[] excelData = excelExportService.exportAttendanceReport(employeeIds, startDate, endDate);
        
        String filename = "Attendance_Report_" + 
                         startDate.format(FILE_DATE_FORMATTER) + "_to_" + 
                         endDate.format(FILE_DATE_FORMATTER) + ".xlsx";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(excelData.length);
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(excelData);
    }
    
    @GetMapping("/payments/export")
    public ResponseEntity<byte[]> exportPaymentReport(
            @RequestParam(required = false) List<Long> employeeIds,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) throws IOException {
        
        byte[] excelData = excelExportService.exportPaymentReport(employeeIds, startDate, endDate);
        
        String filename = "Payment_Report_" + 
                         startDate.format(FILE_DATE_FORMATTER) + "_to_" + 
                         endDate.format(FILE_DATE_FORMATTER) + ".xlsx";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(excelData.length);
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(excelData);
    }
}
