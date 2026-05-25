import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { TextInput, Button, Menu, Card, Text, Paragraph } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updatePayment, getCurrentSalaryCycleSummary } from '../services/api';
import { formatDateForDisplay } from '../utils/dateFormatter';
import { getErrorMessage } from '../utils/errorHandler';

const PAYMENT_TYPES = ['SALARY', 'ADVANCE', 'DEDUCTION'];

export default function EditPaymentScreen({ route, navigation }) {
  const { payment } = route.params;

  const [paymentType, setPaymentType] = useState(payment.paymentType);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [amount, setAmount] = useState(payment.amount.toString());
  const [paymentDate, setPaymentDate] = useState(new Date(payment.paymentDate));
  const [description, setDescription] = useState(payment.description || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [salaryCycleSummary, setSalaryCycleSummary] = useState(null);

  useEffect(() => {
    loadSalaryCycleSummary();
  }, []);

  const loadSalaryCycleSummary = async () => {
    try {
      const response = await getCurrentSalaryCycleSummary(payment.employeeId);
      setSalaryCycleSummary(response.data);
    } catch (error) {
      console.error('Failed to load salary cycle summary:', error);
      setSalaryCycleSummary(null);
    }
  };

  const handleSubmit = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Payment amount must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      const updatedPayment = {
        employeeId: payment.employeeId,
        paymentDate: paymentDate.toISOString().split('T')[0],
        amount: parseFloat(amount),
        paymentType,
        description,
      };

      await updatePayment(payment.id, updatedPayment);
      Alert.alert('Success', 'Payment updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to update payment');
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.employeeName}>Employee: {payment.employeeName}</Text>

        {salaryCycleSummary && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryTitle}>Current Salary Cycle</Text>
              <View style={styles.summaryRow}>
                <Paragraph>Monthly Salary:</Paragraph>
                <Paragraph style={styles.summaryValue}>₹{salaryCycleSummary.monthlySalary?.toLocaleString('en-IN')}</Paragraph>
              </View>
              {salaryCycleSummary.totalDeduction > 0 && (
                <View style={styles.summaryRow}>
                  <Paragraph>Deduction:</Paragraph>
                  <Paragraph style={[styles.summaryValue, styles.deductionText]}>-₹{salaryCycleSummary.totalDeduction?.toLocaleString('en-IN')}</Paragraph>
                </View>
              )}
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
          Update Payment
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
    fontWeight: 'bold',
  },
  remainingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  remainingValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
});
