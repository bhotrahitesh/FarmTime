import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Searchbar, DataTable, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getAllEmployeesCurrentCycleSummary } from '../services/api';
import { formatDate, formatDateForDisplay } from '../utils/dateFormatter';
import { getErrorMessage } from '../utils/errorHandler';

export default function SalaryCycleScreen({ navigation }) {
  const [summaries, setSummaries] = useState([]);
  const [filteredSummaries, setFilteredSummaries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSalaryCycleSummaries();
    }, [])
  );

  const loadSalaryCycleSummaries = async () => {
    setLoading(true);
    try {
      console.log('Loading salary cycle summaries...');
      const response = await getAllEmployeesCurrentCycleSummary();
      console.log('Response received:', response);
      console.log('Response data:', response.data);
      setSummaries(response.data || []);
      setFilteredSummaries(response.data || []);
    } catch (error) {
      console.error('Error loading salary cycle summaries:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      const errorMessage = getErrorMessage(error, 'Failed to load salary cycle summaries');
      Alert.alert('Error', errorMessage);
      setSummaries([]);
      setFilteredSummaries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredSummaries(summaries);
    } else {
      const filtered = summaries.filter((item) =>
        item.employeeName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSummaries(filtered);
    }
  };

  const renderSummary = ({ item }) => {
    if (!item) return null;
    
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>{item.employeeName || 'Unknown Employee'}</Title>
          <Paragraph style={styles.cycleInfo}>
            Cycle: {item.cycleStartDate || 'N/A'} - {item.cycleEndDate || 'N/A'}
          </Paragraph>
          <Paragraph style={styles.cycleInfo}>
            Payday: Day {item.salaryPayday || 1} of each month
          </Paragraph>
          
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <Text style={styles.label}>Monthly Salary:</Text>
            <Text style={styles.value}>₹{(item.monthlySalary || 0).toLocaleString('en-IN')}</Text>
          </View>
          
          {(item.totalBonus || 0) > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Bonus:</Text>
              <Text style={[styles.value, styles.bonus]}>+₹{(item.totalBonus || 0).toLocaleString('en-IN')}</Text>
            </View>
          )}
          
          {(item.totalDeduction || 0) > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Deduction:</Text>
              <Text style={[styles.value, styles.deduction]}>-₹{(item.totalDeduction || 0).toLocaleString('en-IN')}</Text>
            </View>
          )}
          
          <View style={styles.row}>
            <Text style={[styles.label, styles.bold]}>Net Payable:</Text>
            <Text style={[styles.value, styles.bold]}>₹{(item.netPayable || 0).toLocaleString('en-IN')}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <Text style={styles.label}>Total Paid:</Text>
            <Text style={styles.value}>₹{(item.totalPaid || 0).toLocaleString('en-IN')}</Text>
          </View>
          
          {(item.totalAdvance || 0) > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>  (Advance):</Text>
              <Text style={styles.value}>₹{(item.totalAdvance || 0).toLocaleString('en-IN')}</Text>
            </View>
          )}
          
          <View style={styles.row}>
            <Text style={[styles.label, styles.bold, styles.remaining]}>Remaining:</Text>
            <Text style={[styles.value, styles.bold, (item.remainingAmount || 0) >= 0 ? styles.remainingPositive : styles.remainingNegative]}>
              ₹{(item.remainingAmount || 0).toLocaleString('en-IN')}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by employee name"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={filteredSummaries}
        renderItem={renderSummary}
        keyExtractor={(item) => item.employeeId.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadSalaryCycleSummaries}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 16,
    elevation: 0,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cycleInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#000',
  },
  bold: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  bonus: {
    color: '#4CAF50',
  },
  deduction: {
    color: '#F44336',
  },
  remaining: {
    color: '#2196F3',
  },
  remainingPositive: {
    color: '#4CAF50',
  },
  remainingNegative: {
    color: '#F44336',
  },
});
