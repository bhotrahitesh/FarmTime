import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { FAB, Card, Title, Paragraph, Chip, Searchbar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getTimeOffByDateRange } from '../services/api';
import { formatDate } from '../utils/dateFormatter';
import { getErrorMessage } from '../utils/errorHandler';

export default function TimeOffScreen({ navigation }) {
  const [timeOffs, setTimeOffs] = useState([]);
  const [filteredTimeOffs, setFilteredTimeOffs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadTimeOffs();
    }, [])
  );

  const loadTimeOffs = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString().split('T')[0];
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        .toISOString().split('T')[0];
      
      const response = await getTimeOffByDateRange(startDate, endDate);
      setTimeOffs(response.data || []);
      setFilteredTimeOffs(response.data || []);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to load time off records');
      Alert.alert('Error', errorMessage);
      setTimeOffs([]);
      setFilteredTimeOffs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredTimeOffs(timeOffs);
    } else {
      const filtered = timeOffs.filter((item) =>
        item.employeeName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredTimeOffs(filtered);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'SICK_LEAVE':
        return '#F44336';
      case 'CASUAL_LEAVE':
        return '#2196F3';
      case 'HOLIDAY':
        return '#4CAF50';
      case 'UNPAID_LEAVE':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const renderTimeOff = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title>{item.employeeName}</Title>
          <Chip
            mode="flat"
            style={[styles.chip, { backgroundColor: getTypeColor(item.timeOffType) }]}
          >
            {item.timeOffType.replace('_', ' ')}
          </Chip>
        </View>
        <Paragraph>
          From: {formatDate(item.startDate)}
        </Paragraph>
        <Paragraph>
          To: {formatDate(item.endDate)}
        </Paragraph>
        {item.reason && <Paragraph>Reason: {item.reason}</Paragraph>}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by employee name"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={filteredTimeOffs}
        renderItem={renderTimeOff}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadTimeOffs}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddTimeOff')}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chip: {
    minWidth: 100,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});
