import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Divider } from 'react-native-paper';
import { deleteEmployee } from '../services/api';
import { formatDate } from '../utils/dateFormatter';
import { getErrorMessage } from '../utils/errorHandler';

export default function EmployeeDetailScreen({ route, navigation }) {
  const { employee } = route.params;

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to permanently delete ${employee.name}?\n\n⚠️ WARNING: This will also delete ALL related records including:\n• Attendance history\n• Payment records\n• Time-off requests\n\nThis action cannot be undone!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEmployee(employee.id);
              Alert.alert('Success', 'Employee and all related records deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              const errorMessage = getErrorMessage(error, 'Failed to delete employee');
              Alert.alert('Delete Failed', errorMessage);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{employee.name}</Title>
          <Divider style={styles.divider} />
          
          <View style={styles.row}>
            <Paragraph style={styles.label}>Phone:</Paragraph>
            <Paragraph style={styles.value}>{employee.phoneNumber}</Paragraph>
          </View>

          <View style={styles.row}>
            <Paragraph style={styles.label}>Address:</Paragraph>
            <Paragraph style={styles.value}>{employee.address || 'N/A'}</Paragraph>
          </View>

          <View style={styles.row}>
            <Paragraph style={styles.label}>Monthly Salary:</Paragraph>
            <Paragraph style={styles.value}>
              ₹{employee.monthlySalary?.toLocaleString('en-IN')}
            </Paragraph>
          </View>

          <View style={styles.row}>
            <Paragraph style={styles.label}>Joining Date:</Paragraph>
            <Paragraph style={styles.value}>
              {formatDate(employee.joiningDate)}
            </Paragraph>
          </View>

          <View style={styles.row}>
            <Paragraph style={styles.label}>Status:</Paragraph>
            <Paragraph style={[styles.value, styles.active]}>
              {employee.isActive ? 'Active' : 'Inactive'}
            </Paragraph>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('EditEmployee', { employee })}
          style={styles.editButton}
          buttonColor="#2196F3"
          icon="pencil"
        >
          Edit Employee
        </Button>
        <Button
          mode="contained"
          onPress={handleDelete}
          style={styles.deleteButton}
          buttonColor="#F44336"
          icon="delete"
        >
          Delete Employee
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
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    color: '#666',
  },
  value: {
    color: '#333',
  },
  active: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  actions: {
    padding: 16,
  },
  editButton: {
    paddingVertical: 6,
    marginBottom: 12,
  },
  deleteButton: {
    paddingVertical: 6,
  },
});
