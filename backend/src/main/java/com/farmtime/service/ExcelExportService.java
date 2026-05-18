package com.farmtime.service;

import com.farmtime.dto.SalaryCycleSummaryDTO;
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
    private final SalaryCycleService salaryCycleService;
    
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
            CellStyle titleStyle = createTitleStyle(workbook);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 6));
            
            // Create date range row
            Row dateRangeRow = sheet.createRow(1);
            Cell dateRangeCell = dateRangeRow.createCell(0);
            dateRangeCell.setCellValue("Period: " + startDate.format(DATE_FORMATTER) + " to " + endDate.format(DATE_FORMATTER));
            CellStyle dateRangeStyle = workbook.createCellStyle();
            dateRangeStyle.setAlignment(HorizontalAlignment.CENTER);
            dateRangeCell.setCellStyle(dateRangeStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(1, 1, 0, 6));
            
            // Create header row
            Row headerRow = sheet.createRow(3);
            String[] headers = {"No.", "Employee Name", "Date", "Check In", "Check Out", "Status", "Notes"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Fill data rows
            int rowNum = 4;
            int serialNo = 1;
            CellStyle centerStyle = workbook.createCellStyle();
            centerStyle.setAlignment(HorizontalAlignment.CENTER);
            
            for (Attendance attendance : attendanceList) {
                Row row = sheet.createRow(rowNum++);
                
                Cell serialCell = row.createCell(0);
                serialCell.setCellValue(serialNo++);
                serialCell.setCellStyle(centerStyle);
                
                row.createCell(1).setCellValue(attendance.getEmployee().getName());
                
                Cell dateCell = row.createCell(2);
                dateCell.setCellValue(attendance.getAttendanceDate().format(DATE_FORMATTER));
                dateCell.setCellStyle(centerStyle);
                
                Cell checkInCell = row.createCell(3);
                checkInCell.setCellValue(attendance.getCheckInTime() != null ? 
                    attendance.getCheckInTime().format(TIME_FORMATTER) : "");
                checkInCell.setCellStyle(centerStyle);
                
                Cell checkOutCell = row.createCell(4);
                checkOutCell.setCellValue(attendance.getCheckOutTime() != null ? 
                    attendance.getCheckOutTime().format(TIME_FORMATTER) : "");
                checkOutCell.setCellStyle(centerStyle);
                
                Cell statusCell = row.createCell(5);
                statusCell.setCellValue(attendance.getIsPresent() ? "Present" : "Absent");
                statusCell.setCellStyle(centerStyle);
                
                row.createCell(6).setCellValue(attendance.getNotes() != null ? attendance.getNotes() : "");
            }
            
            // Set column widths
            sheet.setColumnWidth(0, 1500);  // No. column - narrow
            sheet.autoSizeColumn(1);  // Employee Name
            sheet.setColumnWidth(2, 3500);  // Date
            sheet.setColumnWidth(3, 2500);  // Check In
            sheet.setColumnWidth(4, 2500);  // Check Out
            sheet.setColumnWidth(5, 2500);  // Status
            sheet.autoSizeColumn(6);  // Notes
            
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
            CellStyle centerStyle = workbook.createCellStyle();
            centerStyle.setAlignment(HorizontalAlignment.CENTER);
            
            // Create title row
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Payment Report");
            CellStyle titleStyle = createTitleStyle(workbook);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 6));
            
            // Create date range row
            Row dateRangeRow = sheet.createRow(1);
            Cell dateRangeCell = dateRangeRow.createCell(0);
            dateRangeCell.setCellValue("Period: " + startDate.format(DATE_FORMATTER) + " to " + endDate.format(DATE_FORMATTER));
            CellStyle dateRangeStyle = workbook.createCellStyle();
            dateRangeStyle.setAlignment(HorizontalAlignment.CENTER);
            dateRangeCell.setCellStyle(dateRangeStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(1, 1, 0, 6));
            
            // Create header row (removed Remaining column)
            Row headerRow = sheet.createRow(3);
            String[] headers = {"No.", "Employee Name", "Monthly Salary (₹)", "Date", "Amount (₹)", "Payment Type", "Description"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Fill data rows and track employee-wise totals
            int rowNum = 4;
            int serialNo = 1;
            double totalAmount = 0.0;
            java.util.Map<String, EmployeePaymentSummary> employeeSummaries = new java.util.LinkedHashMap<>();
            
            for (Payment payment : paymentList) {
                Row row = sheet.createRow(rowNum++);
                
                Cell serialCell = row.createCell(0);
                serialCell.setCellValue(serialNo++);
                serialCell.setCellStyle(centerStyle);
                
                String employeeName = payment.getEmployee().getName();
                Long employeeId = payment.getEmployee().getId();
                row.createCell(1).setCellValue(employeeName);
                
                // Add monthly salary
                Cell monthlySalaryCell = row.createCell(2);
                double monthlySalary = payment.getEmployee().getMonthlySalary();
                monthlySalaryCell.setCellValue(monthlySalary);
                monthlySalaryCell.setCellStyle(currencyStyle);
                
                Cell dateCell = row.createCell(3);
                dateCell.setCellValue(payment.getPaymentDate().format(DATE_FORMATTER));
                dateCell.setCellStyle(centerStyle);
                
                Cell amountCell = row.createCell(4);
                amountCell.setCellValue(payment.getAmount());
                amountCell.setCellStyle(currencyStyle);
                
                Cell typeCell = row.createCell(5);
                typeCell.setCellValue(payment.getPaymentType().toString().replace("_", " "));
                typeCell.setCellStyle(centerStyle);
                
                row.createCell(6).setCellValue(payment.getDescription() != null ? payment.getDescription() : "");
                
                totalAmount += payment.getAmount();
                
                // Track employee-wise summary
                String empKey = employeeId + "_" + employeeName;
                employeeSummaries.putIfAbsent(empKey, new EmployeePaymentSummary(employeeName, monthlySalary));
                employeeSummaries.get(empKey).addPayment(payment.getAmount());
            }
            
            // Add total row
            Row totalRow = sheet.createRow(rowNum + 1);
            Cell totalLabelCell = totalRow.createCell(3);
            totalLabelCell.setCellValue("Total:");
            totalLabelCell.setCellStyle(headerStyle);
            
            Cell totalAmountCell = totalRow.createCell(4);
            totalAmountCell.setCellValue(totalAmount);
            CellStyle totalStyle = createCurrencyStyle(workbook);
            Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            totalStyle.setFont(boldFont);
            totalAmountCell.setCellStyle(totalStyle);
            
            // Add employee-wise summary section
            rowNum += 3; // Add some spacing
            
            // Summary section title
            Row summaryTitleRow = sheet.createRow(rowNum++);
            Cell summaryTitleCell = summaryTitleRow.createCell(0);
            summaryTitleCell.setCellValue("Employee-wise Payment Summary");
            summaryTitleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(rowNum - 1, rowNum - 1, 0, 3));
            
            rowNum++; // Empty row
            
            // Summary header
            Row summaryHeaderRow = sheet.createRow(rowNum++);
            String[] summaryHeaders = {"Employee Name", "Monthly Salary (₹)", "Total Paid (₹)", "Remaining (₹)"};
            for (int i = 0; i < summaryHeaders.length; i++) {
                Cell cell = summaryHeaderRow.createCell(i);
                cell.setCellValue(summaryHeaders[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Summary data rows
            for (EmployeePaymentSummary summary : employeeSummaries.values()) {
                Row summaryRow = sheet.createRow(rowNum++);
                
                summaryRow.createCell(0).setCellValue(summary.getEmployeeName());
                
                Cell salaryCell = summaryRow.createCell(1);
                salaryCell.setCellValue(summary.getMonthlySalary());
                salaryCell.setCellStyle(currencyStyle);
                
                Cell paidCell = summaryRow.createCell(2);
                paidCell.setCellValue(summary.getTotalPaid());
                paidCell.setCellStyle(currencyStyle);
                
                Cell remainingCell = summaryRow.createCell(3);
                double remaining = summary.getMonthlySalary() - summary.getTotalPaid();
                remainingCell.setCellValue(remaining);
                
                // Color code remaining amount
                CellStyle remainingStyle = createCurrencyStyle(workbook);
                if (remaining < 0) {
                    Font redFont = workbook.createFont();
                    redFont.setColor(IndexedColors.RED.getIndex());
                    redFont.setBold(true);
                    remainingStyle.setFont(redFont);
                } else if (remaining > 0) {
                    Font greenFont = workbook.createFont();
                    greenFont.setColor(IndexedColors.DARK_GREEN.getIndex());
                    greenFont.setBold(true);
                    remainingStyle.setFont(greenFont);
                }
                remainingCell.setCellStyle(remainingStyle);
            }
            
            // Set column widths
            sheet.setColumnWidth(0, 1500);  // No. column - narrow
            sheet.autoSizeColumn(1);  // Employee Name
            sheet.setColumnWidth(2, 4500);  // Monthly Salary
            sheet.setColumnWidth(3, 3500);  // Date
            sheet.setColumnWidth(4, 3500);  // Amount
            sheet.setColumnWidth(5, 3500);  // Payment Type
            sheet.autoSizeColumn(6);  // Description
            
            workbook.write(out);
            return out.toByteArray();
        }
    }
    
    // Helper class for employee payment summary
    private static class EmployeePaymentSummary {
        private final String employeeName;
        private final double monthlySalary;
        private double totalPaid;
        
        public EmployeePaymentSummary(String employeeName, double monthlySalary) {
            this.employeeName = employeeName;
            this.monthlySalary = monthlySalary;
            this.totalPaid = 0.0;
        }
        
        public void addPayment(double amount) {
            this.totalPaid += amount;
        }
        
        public String getEmployeeName() {
            return employeeName;
        }
        
        public double getMonthlySalary() {
            return monthlySalary;
        }
        
        public double getTotalPaid() {
            return totalPaid;
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
