import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Menu, TextInput } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { getActiveEmployees, createPayment } from '../services/api';

const PAYMENT_TYPES = ['SALARY', 'ADVANCE', 'BONUS', 'DEDUCTION'];

export default function AddPaymentScreen({ navigation }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeMenuVisible, setEmployeeMenuVisible] = useState(false);
  const [paymentType, setPaymentType] = useState('SALARY');
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
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
    if (!selectedEmployee || !amount) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const payment = {
        employeeId: selectedEmployee.id,
        paymentDate: paymentDate.toISOString().split('T')[0],
        amount: parseFloat(amount),
        paymentType,
        description,
      };

      await createPayment(payment);
      Alert.alert('Success', 'Payment added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add payment');
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
              Payment Type: {paymentType}
            </Button>
          }
        >
          {PAYMENT_TYPES.map((type) => (
            <Menu.Item
              key={type}
              onPress={() => {
                setPaymentType(type);
                setTypeMenuVisible(false);
              }}
              title={type}
            />
          ))}
        </Menu>

        <TextInput
          label="Amount (₹) *"
          value={amount}
          onChangeText={setAmount}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
        />

        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={styles.input}
        >
          Payment Date: {paymentDate.toLocaleDateString('en-IN')}
        </Button>

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <DatePicker
          modal
          open={showDatePicker}
          date={paymentDate}
          mode="date"
          onConfirm={(date) => {
            setShowDatePicker(false);
            setPaymentDate(date);
          }}
          onCancel={() => setShowDatePicker(false)}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}
          buttonColor="#4CAF50"
        >
          Add Payment
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
