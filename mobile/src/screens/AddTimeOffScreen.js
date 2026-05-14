import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { TextInput, Button, Menu } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getActiveEmployees, createTimeOff } from '../services/api';
import { formatDateForDisplay } from '../utils/dateFormatter';
import { getErrorMessage } from '../utils/errorHandler';

const TIME_OFF_TYPES = ['SICK_LEAVE', 'CASUAL_LEAVE', 'HOLIDAY', 'UNPAID_LEAVE'];

export default function AddTimeOffScreen({ navigation }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeMenuVisible, setEmployeeMenuVisible] = useState(false);
  const [timeOffType, setTimeOffType] = useState('CASUAL_LEAVE');
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
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

  const handleSubmit = async () => {
    if (!selectedEmployee) {
      Alert.alert('Error', 'Please select an employee');
      return;
    }

    if (endDate < startDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      const timeOff = {
        employeeId: selectedEmployee.id,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        timeOffType,
        reason,
      };

      await createTimeOff(timeOff);
      Alert.alert('Success', 'Time off added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to add time off');
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Menu
          visible={employeeMenuVisible}
          onDismiss={() => setEmployeeMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setEmployeeMenuVisible(true)}
              style={styles.input}
            >
              {selectedEmployee ? selectedEmployee.name : 'Select Employee *'}
            </Button>
          }
        >
          {employees.map((emp) => (
            <Menu.Item
              key={emp.id}
              onPress={() => {
                setSelectedEmployee(emp);
                setEmployeeMenuVisible(false);
              }}
              title={emp.name}
            />
          ))}
        </Menu>

        <Menu
          visible={typeMenuVisible}
          onDismiss={() => setTypeMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setTypeMenuVisible(true)}
              style={styles.input}
            >
              Type: {timeOffType.replace('_', ' ')}
            </Button>
          }
        >
          {TIME_OFF_TYPES.map((type) => (
            <Menu.Item
              key={type}
              onPress={() => {
                setTimeOffType(type);
                setTypeMenuVisible(false);
              }}
              title={type.replace('_', ' ')}
            />
          ))}
        </Menu>

        <Button
          mode="outlined"
          onPress={() => setShowStartDatePicker(true)}
          style={styles.input}
        >
          Start Date: {formatDateForDisplay(startDate)}
        </Button>

        <Button
          mode="outlined"
          onPress={() => setShowEndDatePicker(true)}
          style={styles.input}
        >
          End Date: {formatDateForDisplay(endDate)}
        </Button>

        <TextInput
          label="Reason"
          value={reason}
          onChangeText={setReason}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

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

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}
          buttonColor="#4CAF50"
        >
          Add Time Off
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
  button: {
    marginTop: 16,
    paddingVertical: 6,
  },
});
