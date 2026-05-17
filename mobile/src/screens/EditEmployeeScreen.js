import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { TextInput, Button, Switch, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateEmployee } from '../services/api';
import { formatDateForDisplay } from '../utils/dateFormatter';
import { getErrorMessage } from '../utils/errorHandler';

export default function EditEmployeeScreen({ route, navigation }) {
  const { employee } = route.params;
  
  const [name, setName] = useState(employee.name);
  const [phoneNumber, setPhoneNumber] = useState(employee.phoneNumber);
  const [address, setAddress] = useState(employee.address || '');
  const [monthlySalary, setMonthlySalary] = useState(employee.monthlySalary.toString());
  const [joiningDate, setJoiningDate] = useState(new Date(employee.joiningDate));
  const [isActive, setIsActive] = useState(employee.isActive);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !phoneNumber || !monthlySalary) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const updatedEmployee = {
        name,
        phoneNumber,
        address,
        monthlySalary: parseFloat(monthlySalary),
        joiningDate: joiningDate.toISOString().split('T')[0],
        isActive,
      };

      await updateEmployee(employee.id, updatedEmployee);
      Alert.alert('Success', 'Employee updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to update employee');
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <TextInput
          label="Name *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Phone Number *"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          mode="outlined"
          keyboardType="phone-pad"
          style={styles.input}
        />
        <TextInput
          label="Address"
          value={address}
          onChangeText={setAddress}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <TextInput
          label="Monthly Salary (₹) *"
          value={monthlySalary}
          onChangeText={setMonthlySalary}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
        />
        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={styles.input}
        >
          Joining Date: {formatDateForDisplay(joiningDate)}
        </Button>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Active Employee</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            color="#4CAF50"
          />
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={joiningDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setJoiningDate(selectedDate);
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
          Update Employee
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
  switchLabel: {
    fontSize: 16,
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
  },
});
