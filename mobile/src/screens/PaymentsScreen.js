import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { FAB, Card, Title, Paragraph, Chip } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getPaymentsByDateRange } from '../services/api';

export default function PaymentsScreen({ navigation }) {
  const [payments, setPayments] = useState([]);
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
      setPayments(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentTypeColor = (type) => {
    switch (type) {
      case 'SALARY':
        return '#4CAF50';
      case 'ADVANCE':
        return '#FF9800';
      case 'BONUS':
        return '#2196F3';
      case 'DEDUCTION':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
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
        <Paragraph>Date: {new Date(item.paymentDate).toLocaleDateString('en-IN')}</Paragraph>
        {item.description && <Paragraph>Description: {item.description}</Paragraph>}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={payments}
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});
