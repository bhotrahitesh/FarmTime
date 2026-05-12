import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Menu, Switch, Text, TextInput } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { getActiveEmployees, markAttendance } from '../services/api';

export default function MarkAttendanceScreen({ navigation }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date());
  const [checkInTime, setCheckInTime] = useState(new Date());
  const [checkOutTime, setCheckOutTime] = useState(new Date());
  const [isPresent, setIsPresent] = useState(true);
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await getActiveEmployees();
      setEmployees(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load employees');
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
        checkInTime: checkInTime.toTimeString().split(' ')[0],
        checkOutTime: checkOutTime.toTimeString().split(' ')[0],
        isPresent,
        notes,
      };

      await markAttendance(attendance);
      Alert.alert('Success', 'Attendance marked successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to mark attendance');
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
            >
              {selectedEmployee ? selectedEmployee.name : 'Select Employee'}
            </Button>
          }
        >
          {employees.map((emp) => (
            <Menu.Item
              key={emp.id}
              onPress={() => {
                setSelectedEmployee(emp);
                setMenuVisible(false);
              }}
              title={emp.name}
            />
          ))}
        </Menu>

        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={styles.input}
        >
          Date: {attendanceDate.toLocaleDateString('en-IN')}
        </Button>

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

        <View style={styles.switchContainer}>
          <Text>Present</Text>
          <Switch value={isPresent} onValueChange={setIsPresent} />
        </View>

        <TextInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <DatePicker
          modal
          open={showDatePicker}
          date={attendanceDate}
          mode="date"
          onConfirm={(date) => {
            setShowDatePicker(false);
            setAttendanceDate(date);
          }}
          onCancel={() => setShowDatePicker(false)}
        />

        <DatePicker
          modal
          open={showCheckInPicker}
          date={checkInTime}
          mode="time"
          onConfirm={(time) => {
            setShowCheckInPicker(false);
            setCheckInTime(time);
          }}
          onCancel={() => setShowCheckInPicker(false)}
        />

        <DatePicker
          modal
          open={showCheckOutPicker}
          date={checkOutTime}
          mode="time"
          onConfirm={(time) => {
            setShowCheckOutPicker(false);
            setCheckOutTime(time);
          }}
          onCancel={() => setShowCheckOutPicker(false)}
        />

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
