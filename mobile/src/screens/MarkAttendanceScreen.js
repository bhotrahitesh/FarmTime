import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Button, Menu, Switch, Text, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getActiveEmployees, markAttendance } from '../services/api';
import { formatDateForDisplay } from '../utils/dateFormatter';
import { getErrorMessage } from '../utils/errorHandler';

const ATTENDANCE_STATUSES = [
  { value: 'PRESENT', label: 'Present (Full Day)' },
  { value: 'HALF_DAY', label: 'Half Day' },
  { value: 'ABSENT', label: 'Absent' },
  { value: 'SICK_LEAVE', label: 'Sick Leave' },
  { value: 'CASUAL_LEAVE', label: 'Casual Leave' },
];

export default function MarkAttendanceScreen({ navigation }) {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date());
  const [checkInTime, setCheckInTime] = useState(new Date());
  const [checkOutTime, setCheckOutTime] = useState(new Date());
  const [isPresent, setIsPresent] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState('PRESENT');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [hoursWorked, setHoursWorked] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployeesByJoiningDate();
  }, [employees, attendanceDate]);

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

  const filterEmployeesByJoiningDate = () => {
    const selectedDate = attendanceDate.toISOString().split('T')[0];
    const filtered = employees.filter(emp => {
      if (!emp.isActive) return false;
      
      let empJoiningDate = emp.joiningDate;
      if (typeof empJoiningDate === 'string') {
        empJoiningDate = empJoiningDate.split('T')[0];
      } else if (empJoiningDate instanceof Date) {
        empJoiningDate = empJoiningDate.toISOString().split('T')[0];
      }
      
      return empJoiningDate <= selectedDate;
    });
    setFilteredEmployees(filtered);
    
    // If selected employee is no longer in filtered list, clear selection
    if (selectedEmployee && !filtered.find(emp => emp.id === selectedEmployee.id)) {
      setSelectedEmployee(null);
    }
  };

  const handleStatusChange = (status) => {
    setAttendanceStatus(status);
    setStatusMenuVisible(false);
    
    // Auto-set isPresent based on status
    if (status === 'ABSENT' || status === 'SICK_LEAVE' || status === 'CASUAL_LEAVE') {
      setIsPresent(false);
    } else {
      setIsPresent(true);
    }
    
    // Set default hours for half day
    if (status === 'HALF_DAY' && !hoursWorked) {
      setHoursWorked('4');
    }
  };

  const handleSubmit = async () => {
    if (!selectedEmployee) {
      Alert.alert('Error', 'Please select an employee');
      return;
    }

    setLoading(true);
    try {
      const attendance = {
        employeeId: selectedEmployee.id,
        attendanceDate: attendanceDate.toISOString().split('T')[0],
        checkInTime: (attendanceStatus !== 'ABSENT' && attendanceStatus !== 'SICK_LEAVE' && attendanceStatus !== 'CASUAL_LEAVE') 
          ? checkInTime.toTimeString().split(' ')[0] 
          : null,
        checkOutTime: (attendanceStatus !== 'ABSENT' && attendanceStatus !== 'SICK_LEAVE' && attendanceStatus !== 'CASUAL_LEAVE') 
          ? checkOutTime.toTimeString().split(' ')[0] 
          : null,
        isPresent,
        attendanceStatus,
        hoursWorked: hoursWorked ? parseFloat(hoursWorked) : null,
        notes,
      };

      await markAttendance(attendance);
      Alert.alert('Success', 'Attendance marked successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to mark attendance');
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              style={styles.input}
              disabled={filteredEmployees.length === 0}
            >
              {selectedEmployee ? selectedEmployee.name : filteredEmployees.length === 0 ? 'No employees available for this date' : 'Select Employee'}
            </Button>
          }
        >
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp) => (
              <Menu.Item
                key={emp.id}
                onPress={() => {
                  setSelectedEmployee(emp);
                  setMenuVisible(false);
                }}
                title={emp.name}
              />
            ))
          ) : (
            <Menu.Item
              title="No employees available for this date"
              disabled
            />
          )}
        </Menu>

        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={styles.input}
        >
          Date: {formatDateForDisplay(attendanceDate)}
        </Button>

        <Menu
          visible={statusMenuVisible}
          onDismiss={() => setStatusMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setStatusMenuVisible(true)}
              style={styles.input}
            >
              Status: {ATTENDANCE_STATUSES.find(s => s.value === attendanceStatus)?.label || 'Select Status'}
            </Button>
          }
        >
          {ATTENDANCE_STATUSES.map((status) => (
            <Menu.Item
              key={status.value}
              onPress={() => handleStatusChange(status.value)}
              title={status.label}
            />
          ))}
        </Menu>

        {(attendanceStatus === 'PRESENT' || attendanceStatus === 'HALF_DAY') && (
          <>
            <Button
              mode="outlined"
              onPress={() => setShowCheckInPicker(true)}
              style={styles.input}
            >
              Check In: {checkInTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </Button>

            <Button
              mode="outlined"
              onPress={() => setShowCheckOutPicker(true)}
              style={styles.input}
            >
              Check Out: {checkOutTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </Button>
          </>
        )}

        {attendanceStatus === 'HALF_DAY' && (
          <TextInput
            label="Hours Worked"
            value={hoursWorked}
            onChangeText={setHoursWorked}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            placeholder="e.g., 4"
          />
        )}

        <TextInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        {showDatePicker && (
          <DateTimePicker
            value={attendanceDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setAttendanceDate(selectedDate);
              }
            }}
          />
        )}

        {showCheckInPicker && (
          <DateTimePicker
            value={checkInTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedTime) => {
              setShowCheckInPicker(Platform.OS === 'ios');
              if (selectedTime) {
                setCheckInTime(selectedTime);
              }
            }}
          />
        )}

        {showCheckOutPicker && (
          <DateTimePicker
            value={checkOutTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedTime) => {
              setShowCheckOutPicker(Platform.OS === 'ios');
              if (selectedTime) {
                setCheckOutTime(selectedTime);
              }
            }}
          />
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}
          buttonColor="#4CAF50"
        >
          Mark Attendance
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
  },
});
