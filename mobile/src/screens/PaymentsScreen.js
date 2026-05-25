import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { FAB, Card, Title, Paragraph, Chip, Searchbar, Button, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getPaymentsByDateRange, deletePayment } from '../services/api';
import { formatDate } from '../utils/dateFormatter';
import { getErrorMessage } from '../utils/errorHandler';

export default function PaymentsScreen({ navigation }) {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadPayments();
    }, [])
  );

  const loadPayments = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      const response = await getPaymentsByDateRange(startDate, endDate);
      setPayments(response.data || []);
      setFilteredPayments(response.data || []);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to load payments');
      Alert.alert('Error', errorMessage);
      setPayments([]);
      setFilteredPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredPayments(payments);
    } else {
      const filtered = payments.filter((item) =>
        item.employeeName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPayments(filtered);
    }
  };

  const getPaymentTypeColor = (type) => {
    switch (type) {
      case 'SALARY':
        return '#4CAF50';
      case 'ADVANCE':
        return '#FF9800';
      case 'DEDUCTION':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const handleEdit = (payment) => {
    navigation.navigate('EditPayment', { payment });
  };

  const handleDelete = (payment) => {
    Alert.alert(
      'Delete Payment',
      `Are you sure you want to delete this payment of ₹${payment.amount.toLocaleString('en-IN')} for ${payment.employeeName}?`,
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
              await deletePayment(payment.id);
              Alert.alert('Success', 'Payment deleted successfully');
              loadPayments();
            } catch (error) {
              const errorMessage = getErrorMessage(error, 'Failed to delete payment');
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const renderPayment = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title>{item.employeeName}</Title>
          <Chip
            mode="flat"
            style={[styles.chip, { backgroundColor: getPaymentTypeColor(item.paymentType) }]}
          >
            {item.paymentType}
          </Chip>
        </View>
        <Paragraph style={styles.amount}>₹{item.amount?.toLocaleString('en-IN')}</Paragraph>
        <Paragraph>Date: {formatDate(item.paymentDate)}</Paragraph>
        {item.description && <Paragraph>Description: {item.description}</Paragraph>}
        <View style={styles.cardActions}>
          <IconButton
            icon="pencil"
            size={20}
            iconColor="#2196F3"
            onPress={() => handleEdit(item)}
          />
          <IconButton
            icon="delete"
            size={20}
            iconColor="#F44336"
            onPress={() => handleDelete(item)}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search by employee name"
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        <Button
          mode="contained"
          icon="chart-box"
          onPress={() => navigation.navigate('SalaryCycle')}
          style={styles.summaryButton}
          buttonColor="#2196F3"
        >
          Salary Cycle
        </Button>
      </View>
      <FlatList
        data={filteredPayments}
        renderItem={renderPayment}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadPayments}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddPayment')}
        color="white"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingBottom: 8,
  },
  searchBar: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    elevation: 0,
  },
  summaryButton: {
    marginHorizontal: 16,
    marginBottom: 8,
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
  chip: {
    minWidth: 80,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
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
    backgroundColor: '#4CAF50',
  },
});
