import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { TextInput, Button, Menu, Card, Text, Paragraph } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getActiveEmployees, createPayment, getCurrentSalaryCycleSummary } from '../services/api';
import { formatDateForDisplay } from '../utils/dateFormatter';
import { getErrorMessage } from '../utils/errorHandler';

const PAYMENT_TYPES = ['SALARY', 'ADVANCE', 'DEDUCTION'];

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
  const [salaryCycleSummary, setSalaryCycleSummary] = useState(null);

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
      const errorMessage = getErrorMessage(error, 'Failed to add payment');
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
              onPress={async () => {
                setSelectedEmployee(emp);
                setEmployeeMenuVisible(false);
                try {
                  const response = await getCurrentSalaryCycleSummary(emp.id);
                  setSalaryCycleSummary(response.data);
                } catch (error) {
                  console.error('Failed to load salary cycle summary:', error);
                  setSalaryCycleSummary(null);
                }
              }}
              title={emp.name}
            />
          ))}
        </Menu>

        {salaryCycleSummary && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryTitle}>Current Salary Cycle</Text>
              <View style={styles.summaryRow}>
                <Paragraph>Monthly Salary:</Paragraph>
                <Paragraph style={styles.summaryValue}>₹{salaryCycleSummary.monthlySalary?.toLocaleString('en-IN')}</Paragraph>
              </View>
              <View style={styles.summaryRow}>
                <Paragraph>Total Paid:</Paragraph>
                <Paragraph style={styles.summaryValue}>₹{salaryCycleSummary.totalPaid?.toLocaleString('en-IN')}</Paragraph>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.remainingLabel}>Remaining:</Text>
                <Text style={[styles.remainingValue, salaryCycleSummary.remainingAmount >= 0 ? styles.positive : styles.negative]}>
                  ₹{salaryCycleSummary.remainingAmount?.toLocaleString('en-IN')}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

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
          Payment Date: {formatDateForDisplay(paymentDate)}
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

        {showDatePicker && (
          <DateTimePicker
            value={paymentDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setPaymentDate(selectedDate);
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
  summaryCard: {
    marginBottom: 16,
    backgroundColor: '#E3F2FD',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976D2',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryValue: {
    fontWeight: '600',
  },
  remainingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  remainingValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
});
