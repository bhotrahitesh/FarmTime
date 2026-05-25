import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Title, Paragraph, Chip, Searchbar, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getTimeOffByDateRange, deleteTimeOff } from '../services/api';
import { formatDate } from '../utils/dateFormatter';
import { getErrorMessage } from '../utils/errorHandler';
import AnimatedCard from '../components/AnimatedCard';
import AnimatedFAB from '../components/AnimatedFAB';

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

  const isLeaveUsed = (startDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const leaveStart = new Date(startDate);
    leaveStart.setHours(0, 0, 0, 0);
    return leaveStart < today;
  };

  const handleEdit = (timeOff) => {
    if (isLeaveUsed(timeOff.startDate)) {
      Alert.alert(
        'Cannot Edit',
        'This leave has already started and cannot be edited.',
        [{ text: 'OK' }]
      );
      return;
    }
    navigation.navigate('EditTimeOff', { timeOff });
  };

  const handleDelete = (timeOff) => {
    if (isLeaveUsed(timeOff.startDate)) {
      Alert.alert(
        'Cannot Delete',
        'This leave has already started and cannot be deleted.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Time Off',
      `Are you sure you want to delete this ${timeOff.timeOffType.replace('_', ' ').toLowerCase()} for ${timeOff.employeeName}?`,
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
              await deleteTimeOff(timeOff.id);
              Alert.alert('Success', 'Time off deleted successfully');
              loadTimeOffs();
            } catch (error) {
              const errorMessage = getErrorMessage(error, 'Failed to delete time off');
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const renderTimeOff = ({ item, index }) => {
    const leaveUsed = isLeaveUsed(item.startDate);
    
    return (
      <AnimatedCard style={styles.card} index={index}>
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
          <View style={styles.cardActions}>
            <IconButton
              icon="pencil"
              size={20}
              iconColor={leaveUsed ? '#BDBDBD' : '#2196F3'}
              onPress={() => handleEdit(item)}
              disabled={leaveUsed}
            />
            <IconButton
              icon="delete"
              size={20}
              iconColor={leaveUsed ? '#BDBDBD' : '#F44336'}
              onPress={() => handleDelete(item)}
              disabled={leaveUsed}
            />
          </View>
        </Card.Content>
      </AnimatedCard>
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
        data={filteredTimeOffs}
        renderItem={renderTimeOff}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadTimeOffs}
      />
      <AnimatedFAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddTimeOff')}
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
