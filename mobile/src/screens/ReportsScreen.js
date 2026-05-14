import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Button, Card, Text, Checkbox, Chip } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getActiveEmployees, exportAttendanceReport, exportPaymentReport } from '../services/api';
import { formatDateForDisplay } from '../utils/dateFormatter';
import { getErrorMessage } from '../utils/errorHandler';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function ReportsScreen() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(1))); // First day of month
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await getActiveEmployees();
      setEmployees(response.data || []);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to load employees');
      Alert.alert('Error', errorMessage);
      setEmployees([]);
    }
  };

  const toggleEmployee = (employeeId) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
    setSelectAll(false);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
      setSelectAll(false);
    } else {
      setSelectedEmployees(employees.map((emp) => emp.id));
      setSelectAll(true);
    }
  };

  const downloadReport = async (reportType) => {
    if (endDate < startDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      const employeeIds = selectedEmployees.length > 0 ? selectedEmployees : null;
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      let response;
      if (reportType === 'attendance') {
        response = await exportAttendanceReport(employeeIds, formattedStartDate, formattedEndDate);
      } else {
        response = await exportPaymentReport(employeeIds, formattedStartDate, formattedEndDate);
      }

      // Generate filename
      const dateStr = `${formattedStartDate}_to_${formattedEndDate}`;
      const filename = `${reportType === 'attendance' ? 'Attendance' : 'Payment'}_Report_${dateStr}.xlsx`;
      
      // Save file
      const fileUri = FileSystem.documentDirectory + filename;
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(response.data);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        
        await FileSystem.writeAsStringAsync(fileUri, base64data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Share the file
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
          Alert.alert('Success', 'Report downloaded successfully');
        } else {
          Alert.alert('Success', `Report saved to ${fileUri}`);
        }
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to generate report');
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Title title="Date Range" />
          <Card.Content>
            <Button
              mode="outlined"
              onPress={() => setShowStartDatePicker(true)}
              style={styles.dateButton}
            >
              Start Date: {formatDateForDisplay(startDate)}
            </Button>

            <Button
              mode="outlined"
              onPress={() => setShowEndDatePicker(true)}
              style={styles.dateButton}
            >
              End Date: {formatDateForDisplay(endDate)}
            </Button>

            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setStartDate(selectedDate);
                  }
                }}
              />
            )}

            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowEndDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setEndDate(selectedDate);
                  }
                }}
              />
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Select Employees" />
          <Card.Content>
            <View style={styles.selectAllContainer}>
              <Checkbox
                status={selectAll ? 'checked' : 'unchecked'}
                onPress={toggleSelectAll}
              />
              <Text style={styles.selectAllText}>
                {selectAll ? 'Deselect All' : 'Select All Employees'}
              </Text>
            </View>

            {selectedEmployees.length === 0 && !selectAll && (
              <Chip icon="information" style={styles.infoChip}>
                No selection = All employees
              </Chip>
            )}

            <View style={styles.employeeList}>
              {employees.map((employee) => (
                <View key={employee.id} style={styles.employeeItem}>
                  <Checkbox
                    status={selectedEmployees.includes(employee.id) ? 'checked' : 'unchecked'}
                    onPress={() => toggleEmployee(employee.id)}
                  />
                  <Text style={styles.employeeName}>{employee.name}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Generate Reports" />
          <Card.Content>
            <Button
              mode="contained"
              onPress={() => downloadReport('attendance')}
              loading={loading}
              disabled={loading}
              style={styles.reportButton}
              buttonColor="#4CAF50"
              icon="download"
            >
              Download Attendance Report
            </Button>

            <Button
              mode="contained"
              onPress={() => downloadReport('payment')}
              loading={loading}
              disabled={loading}
              style={styles.reportButton}
              buttonColor="#2196F3"
              icon="download"
            >
              Download Payment Report
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  dateButton: {
    marginBottom: 12,
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectAllText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoChip: {
    marginBottom: 12,
    backgroundColor: '#E3F2FD',
  },
  employeeList: {
    marginTop: 8,
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  employeeName: {
    fontSize: 16,
    marginLeft: 8,
  },
  reportButton: {
    marginBottom: 12,
    paddingVertical: 6,
  },
});
