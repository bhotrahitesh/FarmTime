package com.farmtime.service;

import com.farmtime.model.Attendance;
import com.farmtime.model.Employee;
import com.farmtime.model.Payment;
import com.farmtime.repository.AttendanceRepository;
import com.farmtime.repository.EmployeeRepository;
import com.farmtime.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExcelExportService {
    
    private final AttendanceRepository attendanceRepository;
    private final PaymentRepository paymentRepository;
    private final EmployeeRepository employeeRepository;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    
    @Transactional(readOnly = true)
    public byte[] exportAttendanceReport(List<Long> employeeIds, LocalDate startDate, LocalDate endDate) throws IOException {
        List<Attendance> attendanceList;
        
        if (employeeIds == null || employeeIds.isEmpty()) {
            // Export for all employees
            attendanceList = attendanceRepository.findByAttendanceDateBetweenOrderByAttendanceDateDescCreatedAtDesc(startDate, endDate);
        } else if (employeeIds.size() == 1) {
            // Export for single employee
            Employee employee = employeeRepository.findById(employeeIds.get(0))
                .orElseThrow(() -> new RuntimeException("Employee not found"));
            attendanceList = attendanceRepository.findByEmployeeAndAttendanceDateBetweenOrderByAttendanceDateDescCreatedAtDesc(employee, startDate, endDate);
        } else {
            // Export for multiple employees
            List<Employee> employees = employeeRepository.findAllById(employeeIds);
            attendanceList = attendanceRepository.findByEmployeeInAndAttendanceDateBetweenOrderByAttendanceDateDescCreatedAtDesc(employees, startDate, endDate);
        }
        
        // Sort by employee name and then by date
        attendanceList.sort((a1, a2) -> {
            int nameCompare = a1.getEmployee().getName().compareTo(a2.getEmployee().getName());
            if (nameCompare != 0) return nameCompare;
            return a1.getAttendanceDate().compareTo(a2.getAttendanceDate());
        });
        
        return generateAttendanceExcel(attendanceList, startDate, endDate);
    }
    
    @Transactional(readOnly = true)
    public byte[] exportPaymentReport(List<Long> employeeIds, LocalDate startDate, LocalDate endDate) throws IOException {
        List<Payment> paymentList;
        
        if (employeeIds == null || employeeIds.isEmpty()) {
            // Export for all employees
            paymentList = paymentRepository.findByPaymentDateBetweenOrderByPaymentDateDescCreatedAtDesc(startDate, endDate);
        } else if (employeeIds.size() == 1) {
            // Export for single employee
            Employee employee = employeeRepository.findById(employeeIds.get(0))
                .orElseThrow(() -> new RuntimeException("Employee not found"));
            paymentList = paymentRepository.findByEmployeeAndPaymentDateBetweenOrderByPaymentDateDescCreatedAtDesc(employee, startDate, endDate);
        } else {
            // Export for multiple employees
            List<Employee> employees = employeeRepository.findAllById(employeeIds);
            paymentList = paymentRepository.findByEmployeeInAndPaymentDateBetweenOrderByPaymentDateDescCreatedAtDesc(employees, startDate, endDate);
        }
        
        // Sort by employee name and then by date
        paymentList.sort((p1, p2) -> {
            int nameCompare = p1.getEmployee().getName().compareTo(p2.getEmployee().getName());
            if (nameCompare != 0) return nameCompare;
            return p1.getPaymentDate().compareTo(p2.getPaymentDate());
        });
        
        return generatePaymentExcel(paymentList, startDate, endDate);
    }
    
    private byte[] generateAttendanceExcel(List<Attendance> attendanceList, LocalDate startDate, LocalDate endDate) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Attendance Report");
            
            // Create header style
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            
            // Create title row
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Attendance Report");
            titleCell.setCellStyle(createTitleStyle(workbook));
            
            // Create date range row
            Row dateRangeRow = sheet.createRow(1);
            Cell dateRangeCell = dateRangeRow.createCell(0);
            dateRangeCell.setCellValue("Period: " + startDate.format(DATE_FORMATTER) + " to " + endDate.format(DATE_FORMATTER));
            
            // Create header row
            Row headerRow = sheet.createRow(3);
            String[] headers = {"S.No", "Employee Name", "Date", "Check In", "Check Out", "Status", "Notes"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Fill data rows
            int rowNum = 4;
            int serialNo = 1;
            for (Attendance attendance : attendanceList) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(serialNo++);
                row.createCell(1).setCellValue(attendance.getEmployee().getName());
                
                Cell dateCell = row.createCell(2);
                dateCell.setCellValue(attendance.getAttendanceDate().format(DATE_FORMATTER));
                
                row.createCell(3).setCellValue(attendance.getCheckInTime() != null ? 
                    attendance.getCheckInTime().format(TIME_FORMATTER) : "");
                row.createCell(4).setCellValue(attendance.getCheckOutTime() != null ? 
                    attendance.getCheckOutTime().format(TIME_FORMATTER) : "");
                row.createCell(5).setCellValue(attendance.getIsPresent() ? "Present" : "Absent");
                row.createCell(6).setCellValue(attendance.getNotes() != null ? attendance.getNotes() : "");
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }
    
    private byte[] generatePaymentExcel(List<Payment> paymentList, LocalDate startDate, LocalDate endDate) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Payment Report");
            
            // Create styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            
            // Create title row
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Payment Report");
            titleCell.setCellStyle(createTitleStyle(workbook));
            
            // Create date range row
            Row dateRangeRow = sheet.createRow(1);
            Cell dateRangeCell = dateRangeRow.createCell(0);
            dateRangeCell.setCellValue("Period: " + startDate.format(DATE_FORMATTER) + " to " + endDate.format(DATE_FORMATTER));
            
            // Create header row
            Row headerRow = sheet.createRow(3);
            String[] headers = {"S.No", "Employee Name", "Date", "Amount (₹)", "Payment Type", "Description"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Fill data rows
            int rowNum = 4;
            int serialNo = 1;
            double totalAmount = 0.0;
            
            for (Payment payment : paymentList) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(serialNo++);
                row.createCell(1).setCellValue(payment.getEmployee().getName());
                row.createCell(2).setCellValue(payment.getPaymentDate().format(DATE_FORMATTER));
                
                Cell amountCell = row.createCell(3);
                amountCell.setCellValue(payment.getAmount());
                amountCell.setCellStyle(currencyStyle);
                
                row.createCell(4).setCellValue(payment.getPaymentType().toString().replace("_", " "));
                row.createCell(5).setCellValue(payment.getDescription() != null ? payment.getDescription() : "");
                
                totalAmount += payment.getAmount();
            }
            
            // Add total row
            Row totalRow = sheet.createRow(rowNum + 1);
            Cell totalLabelCell = totalRow.createCell(2);
            totalLabelCell.setCellValue("Total:");
            totalLabelCell.setCellStyle(headerStyle);
            
            Cell totalAmountCell = totalRow.createCell(3);
            totalAmountCell.setCellValue(totalAmount);
            CellStyle totalStyle = createCurrencyStyle(workbook);
            Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            totalStyle.setFont(boldFont);
            totalAmountCell.setCellStyle(totalStyle);
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }
    
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }
    
    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 16);
        style.setFont(font);
        return style;
    }
    
    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat("dd-mm-yyyy"));
        return style;
    }
    
    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat("₹#,##0.00"));
        return style;
    }
}
