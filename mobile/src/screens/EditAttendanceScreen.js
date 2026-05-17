import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Button, Menu, Text, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateAttendance } from '../services/api';
import { formatDateForDisplay } from '../utils/dateFormatter';
import { getErrorMessage } from '../utils/errorHandler';

const ATTENDANCE_STATUSES = [
  { value: 'PRESENT', label: 'Present (Full Day)' },
  { value: 'HALF_DAY', label: 'Half Day' },
  { value: 'ABSENT', label: 'Absent' },
  { value: 'SICK_LEAVE', label: 'Sick Leave' },
  { value: 'CASUAL_LEAVE', label: 'Casual Leave' },
];

export default function EditAttendanceScreen({ route, navigation }) {
  const { attendance } = route.params;
  
  const [attendanceDate, setAttendanceDate] = useState(new Date(attendance.attendanceDate));
  const [checkInTime, setCheckInTime] = useState(
    attendance.checkInTime 
      ? new Date(`2000-01-01T${attendance.checkInTime}`) 
      : new Date()
  );
  const [checkOutTime, setCheckOutTime] = useState(
    attendance.checkOutTime 
      ? new Date(`2000-01-01T${attendance.checkOutTime}`) 
      : new Date()
  );
  const [isPresent, setIsPresent] = useState(attendance.isPresent);
  const [attendanceStatus, setAttendanceStatus] = useState(attendance.attendanceStatus || 'PRESENT');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [hoursWorked, setHoursWorked] = useState(attendance.hoursWorked ? attendance.hoursWorked.toString() : '');
  const [notes, setNotes] = useState(attendance.notes || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const updatedAttendance = {
        employeeId: attendance.employeeId,
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

      await updateAttendance(attendance.id, updatedAttendance);
      Alert.alert('Success', 'Attendance updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to update attendance');
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.employeeName}>Employee: {attendance.employeeName}</Text>

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
          Update Attendance
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
  employeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
  },
});
