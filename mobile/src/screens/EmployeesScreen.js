import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Title, Paragraph, Chip, Searchbar, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEmployees, deleteEmployee } from '../services/api';
import { formatDate } from '../utils/dateFormatter';
import { getErrorMessage } from '../utils/errorHandler';
import AnimatedCard from '../components/AnimatedCard';
import AnimatedFAB from '../components/AnimatedFAB';

export default function EmployeesScreen({ navigation }) {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('ADMIN');

  useFocusEffect(
    useCallback(() => {
      loadUserRole();
      loadEmployees();
    }, [])
  );

  const loadUserRole = async () => {
    try {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role || 'ADMIN');
    } catch (error) {
      console.error('Failed to load user role:', error);
    }
  };

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await getEmployees();
      setEmployees(response.data || []);
      setFilteredEmployees(response.data || []);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to load employees');
      Alert.alert('Error', errorMessage);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = employees.filter(emp =>
        emp.name.toLowerCase().includes(query.toLowerCase()) ||
        emp.phoneNumber.includes(query)
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  };

  const handleEdit = (employee) => {
    navigation.navigate('EditEmployee', { employee });
  };

  const handleDelete = (employee) => {
    Alert.alert(
      'Delete Employee',
      `Are you sure you want to delete ${employee.name}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEmployee(employee.id);
              Alert.alert('Success', 'Employee deleted successfully');
              loadEmployees();
            } catch (error) {
              const errorMessage = getErrorMessage(error, 'Failed to delete employee');
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const renderEmployee = ({ item, index }) => (
    <AnimatedCard style={styles.card} index={index}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title>{item.name}</Title>
          <Chip mode="flat" style={item.isActive ? styles.activeChip : styles.inactiveChip}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Chip>
        </View>
        <Paragraph>Phone: {item.phoneNumber}</Paragraph>
        <Paragraph>Salary: ₹{item.monthlySalary?.toLocaleString('en-IN')}/month</Paragraph>
        <Paragraph>Joined: {formatDate(item.joiningDate)}</Paragraph>
        <View style={styles.cardActions}>
          <IconButton
            icon="pencil"
            size={20}
            iconColor="#2196F3"
            onPress={() => handleEdit(item)}
          />
          {userRole === 'SUPER_ADMIN' && (
            <IconButton
              icon="delete"
              size={20}
              iconColor="#F44336"
              onPress={() => handleDelete(item)}
            />
          )}
        </View>
      </Card.Content>
    </AnimatedCard>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search employees"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />
      <FlatList
        data={filteredEmployees}
        renderItem={renderEmployee}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadEmployees}
      />
      <AnimatedFAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddEmployee')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeChip: {
    backgroundColor: '#4CAF50',
  },
  inactiveChip: {
    backgroundColor: '#9E9E9E',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    marginRight: -12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
