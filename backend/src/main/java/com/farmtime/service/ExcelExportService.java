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
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
public class ExcelExportService {
    
    private final AttendanceRepository attendanceRepository;
    private final PaymentRepository paymentRepository;
    private final EmployeeRepository employeeRepository;
    private final SalaryCycleService salaryCycleService;
    
    @Value("${salary.payday:10}")
    private Integer globalSalaryPayday;
    
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
            titleRow.setHeightInPoints(30); // Increase row height for title
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Attendance Report");
            CellStyle titleStyle = createTitleStyle(workbook);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            titleStyle.setVerticalAlignment(VerticalAlignment.CENTER);
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
            CellStyle cycleHeaderStyle = createCycleHeaderStyle(workbook);
            
            // Create title row
            Row titleRow = sheet.createRow(0);
            titleRow.setHeightInPoints(30);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Payment Report - Grouped by Salary Cycles");
            CellStyle titleStyle = createTitleStyle(workbook);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            titleStyle.setVerticalAlignment(VerticalAlignment.CENTER);
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
            
            int rowNum = 3;
            
            // Group payments by salary cycles
            Map<String, List<Payment>> cycleGroups = groupPaymentsBySalaryCycle(paymentList, startDate, endDate);
            
            // Sort cycle keys chronologically
            List<String> sortedCycleKeys = new ArrayList<>(cycleGroups.keySet());
            Collections.sort(sortedCycleKeys);
            
            int globalSerialNo = 1;
            
            // Process each salary cycle
            for (String cycleKey : sortedCycleKeys) {
                List<Payment> cyclePayments = cycleGroups.get(cycleKey);
                String[] cycleDates = cycleKey.split("_");
                LocalDate cycleStart = LocalDate.parse(cycleDates[0]);
                LocalDate cycleEnd = LocalDate.parse(cycleDates[1]);
                
                // Salary Cycle Header
                Row cycleHeaderRow = sheet.createRow(rowNum++);
                cycleHeaderRow.setHeightInPoints(25);
                Cell cycleHeaderCell = cycleHeaderRow.createCell(0);
                cycleHeaderCell.setCellValue("Salary Cycle: " + cycleStart.format(DATE_FORMATTER) + " to " + cycleEnd.format(DATE_FORMATTER));
                cycleHeaderCell.setCellStyle(cycleHeaderStyle);
                sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(rowNum - 1, rowNum - 1, 0, 6));
                
                // Column headers for this cycle
                Row headerRow = sheet.createRow(rowNum++);
                String[] headers = {"No.", "Employee Name", "Monthly Salary (₹)", "Date", "Amount (₹)", "Payment Type", "Description"};
                for (int i = 0; i < headers.length; i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
                }
                
                // Payment data for this cycle
                Map<String, EmployeeCycleSummary> employeeSummaries = new LinkedHashMap<>();
                double cycleTotal = 0.0;
                
                for (Payment payment : cyclePayments) {
                    Row row = sheet.createRow(rowNum++);
                    
                    Cell serialCell = row.createCell(0);
                    serialCell.setCellValue(globalSerialNo++);
                    serialCell.setCellStyle(centerStyle);
                    
                    String employeeName = payment.getEmployee().getName();
                    Long employeeId = payment.getEmployee().getId();
                    row.createCell(1).setCellValue(employeeName);
                    
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
                    
                    cycleTotal += payment.getAmount();
                    
                    // Track employee summary for this cycle
                    String empKey = employeeId + "_" + employeeName;
                    employeeSummaries.putIfAbsent(empKey, new EmployeeCycleSummary(employeeName, monthlySalary));
                    employeeSummaries.get(empKey).addPayment(payment);
                }
                
                // Cycle total row
                Row cycleTotalRow = sheet.createRow(rowNum++);
                Cell cycleTotalLabelCell = cycleTotalRow.createCell(3);
                cycleTotalLabelCell.setCellValue("Cycle Total:");
                cycleTotalLabelCell.setCellStyle(headerStyle);
                
                Cell cycleTotalAmountCell = cycleTotalRow.createCell(4);
                cycleTotalAmountCell.setCellValue(cycleTotal);
                CellStyle totalStyle = createCurrencyStyle(workbook);
                Font boldFont = workbook.createFont();
                boldFont.setBold(true);
                totalStyle.setFont(boldFont);
                cycleTotalAmountCell.setCellStyle(totalStyle);
                
                // Employee-wise summary for this cycle
                rowNum++; // Empty row
                Row summaryTitleRow = sheet.createRow(rowNum++);
                summaryTitleRow.setHeightInPoints(30); // Increase height for better visibility
                Cell summaryTitleCell = summaryTitleRow.createCell(0);
                summaryTitleCell.setCellValue("Employees Payment Summary");
                CellStyle summaryTitleStyle = createTitleStyle(workbook);
                summaryTitleCell.setCellStyle(summaryTitleStyle);
                sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(rowNum - 1, rowNum - 1, 0, 7));
                
                Row summaryHeaderRow = sheet.createRow(rowNum++);
                summaryHeaderRow.setHeightInPoints(25); // Increase height for header
                String[] summaryHeaders = {"Employee", "Monthly Salary (₹)", "Salary Paid (₹)", "Advance (₹)", "Bonus (₹)", "Deduction (₹)", "Net Payable (₹)", "Remaining (₹)"};
                for (int i = 0; i < summaryHeaders.length; i++) {
                    Cell cell = summaryHeaderRow.createCell(i);
                    cell.setCellValue(summaryHeaders[i]);
                    cell.setCellStyle(headerStyle);
                    // Auto-size columns for better readability
                    if (i == 0) {
                        sheet.setColumnWidth(i, 6000); // Employee Name - wider for full names
                    } else {
                        sheet.setColumnWidth(i, 4500);
                    }
                }
                
                for (EmployeeCycleSummary summary : employeeSummaries.values()) {
                    Row summaryRow = sheet.createRow(rowNum++);
                    
                    summaryRow.createCell(0).setCellValue(summary.getEmployeeName());
                    
                    Cell salaryCell = summaryRow.createCell(1);
                    salaryCell.setCellValue(summary.getMonthlySalary());
                    salaryCell.setCellStyle(currencyStyle);
                    
                    Cell salaryPaidCell = summaryRow.createCell(2);
                    salaryPaidCell.setCellValue(summary.getSalaryPaid());
                    salaryPaidCell.setCellStyle(currencyStyle);
                    
                    Cell advanceCell = summaryRow.createCell(3);
                    advanceCell.setCellValue(summary.getAdvance());
                    advanceCell.setCellStyle(currencyStyle);
                    
                    Cell bonusCell = summaryRow.createCell(4);
                    bonusCell.setCellValue(summary.getBonus());
                    bonusCell.setCellStyle(currencyStyle);
                    
                    Cell deductionCell = summaryRow.createCell(5);
                    deductionCell.setCellValue(summary.getDeduction());
                    deductionCell.setCellStyle(currencyStyle);
                    
                    double netPayable = summary.getMonthlySalary();
                    Cell netPayableCell = summaryRow.createCell(6);
                    netPayableCell.setCellValue(netPayable);
                    netPayableCell.setCellStyle(currencyStyle);
                    
                    // Remaining = Monthly Salary - (SALARY + ADVANCE + DEDUCTION)
                    double totalPaid = summary.getSalaryPaid() + summary.getAdvance() + summary.getDeduction();
                    double remaining = summary.getMonthlySalary() - totalPaid;
                    
                    Cell remainingCell = summaryRow.createCell(7);
                    remainingCell.setCellValue(remaining);
                    
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
                
                rowNum += 2; // Add spacing between cycles
            }
            
            // Set column widths
            sheet.setColumnWidth(0, 2000);  // No.
            sheet.setColumnWidth(1, 7000);  // Employee Name - wider for full names
            sheet.setColumnWidth(2, 4500);  // Monthly Salary
            sheet.setColumnWidth(3, 4000);  // Date/Salary Paid
            sheet.setColumnWidth(4, 4000);  // Amount/Advance
            sheet.setColumnWidth(5, 3500);  // Payment Type/Bonus
            sheet.setColumnWidth(6, 4000);  // Description/Net Payable
            sheet.setColumnWidth(7, 4000);  // Remaining
            
            workbook.write(out);
            return out.toByteArray();
        }
    }
    
    private Map<String, List<Payment>> groupPaymentsBySalaryCycle(List<Payment> payments, LocalDate startDate, LocalDate endDate) {
        Map<String, List<Payment>> cycleGroups = new LinkedHashMap<>();
        
        for (Payment payment : payments) {
            LocalDate[] cycleDates = calculateCycleDatesForPayment(payment.getPaymentDate());
            String cycleKey = cycleDates[0].toString() + "_" + cycleDates[1].toString();
            
            cycleGroups.putIfAbsent(cycleKey, new ArrayList<>());
            cycleGroups.get(cycleKey).add(payment);
        }
        
        return cycleGroups;
    }
    
    private LocalDate[] calculateCycleDatesForPayment(LocalDate paymentDate) {
        int year = paymentDate.getYear();
        int month = paymentDate.getMonth().getValue();
        int day = paymentDate.getDayOfMonth();
        
        LocalDate cycleStart;
        LocalDate cycleEnd;
        
        // Payday is the END of the cycle, next day starts new cycle
        // Example: If payday = 10, cycle is 11th of prev month to 10th of current month
        if (day > globalSalaryPayday) {
            // We are after payday, so current cycle started day after last month's payday
            YearMonth currentMonth = YearMonth.of(year, month);
            int currentMonthPayday = Math.min(globalSalaryPayday, currentMonth.lengthOfMonth());
            cycleStart = LocalDate.of(year, month, currentMonthPayday).plusDays(1);
            
            YearMonth nextMonth = currentMonth.plusMonths(1);
            int nextMonthPayday = Math.min(globalSalaryPayday, nextMonth.lengthOfMonth());
            cycleEnd = LocalDate.of(nextMonth.getYear(), nextMonth.getMonthValue(), nextMonthPayday);
        } else {
            // We are before or on payday, so current cycle started day after prev month's payday
            YearMonth prevMonth = YearMonth.of(year, month).minusMonths(1);
            int prevMonthPayday = Math.min(globalSalaryPayday, prevMonth.lengthOfMonth());
            cycleStart = LocalDate.of(prevMonth.getYear(), prevMonth.getMonthValue(), prevMonthPayday).plusDays(1);
            
            YearMonth currentMonth = YearMonth.of(year, month);
            int currentMonthPayday = Math.min(globalSalaryPayday, currentMonth.lengthOfMonth());
            cycleEnd = LocalDate.of(year, month, currentMonthPayday);
        }
        
        return new LocalDate[]{cycleStart, cycleEnd};
    }
    
    // Helper class for employee cycle summary with payment type breakdown
    private static class EmployeeCycleSummary {
        private final String employeeName;
        private final double monthlySalary;
        private double salaryPaid = 0.0;
        private double advance = 0.0;
        private double bonus = 0.0;
        private double deduction = 0.0;
        
        public EmployeeCycleSummary(String employeeName, double monthlySalary) {
            this.employeeName = employeeName;
            this.monthlySalary = monthlySalary;
        }
        
        public void addPayment(Payment payment) {
            switch (payment.getPaymentType()) {
                case SALARY:
                    salaryPaid += payment.getAmount();
                    break;
                case ADVANCE:
                    advance += payment.getAmount();
                    break;
                case BONUS:
                    bonus += payment.getAmount();
                    break;
                case DEDUCTION:
                    deduction += payment.getAmount();
                    break;
            }
        }
        
        public String getEmployeeName() {
            return employeeName;
        }
        
        public double getMonthlySalary() {
            return monthlySalary;
        }
        
        public double getSalaryPaid() {
            return salaryPaid;
        }
        
        public double getAdvance() {
            return advance;
        }
        
        public double getBonus() {
            return bonus;
        }
        
        public double getDeduction() {
            return deduction;
        }
    }
    
    // Helper class for employee payment summary (legacy - kept for compatibility)
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
        // Use a pleasant sea green/teal color - easy on the eyes
        style.setFillForegroundColor(IndexedColors.SEA_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
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
    
    private CellStyle createCycleHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        // Use a pleasant teal/green color instead of dark blue
        style.setFillForegroundColor(IndexedColors.TEAL.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        return style;
    }
}
