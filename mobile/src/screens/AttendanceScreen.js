import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Title, Paragraph, Chip, Searchbar, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getAttendanceByDateRange } from '../services/api';
import { formatDate } from '../utils/dateFormatter';
import { getErrorMessage } from '../utils/errorHandler';
import AnimatedCard from '../components/AnimatedCard';
import AnimatedFAB from '../components/AnimatedFAB';

export default function AttendanceScreen({ navigation }) {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadAttendance();
    }, [])
  );

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      const response = await getAttendanceByDateRange(startDate, endDate);
      setAttendance(response.data || []);
      setFilteredAttendance(response.data || []);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to load attendance');
      Alert.alert('Error', errorMessage);
      setAttendance([]);
      setFilteredAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter attendance by search query
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredAttendance(attendance);
    } else {
      const filtered = attendance.filter((item) =>
        item.employeeName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredAttendance(filtered);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PRESENT: '#4CAF50',
      HALF_DAY: '#FF9800',
      ABSENT: '#F44336',
      SICK_LEAVE: '#9C27B0',
      CASUAL_LEAVE: '#2196F3',
      WORK_FROM_HOME: '#00BCD4',
    };
    return colors[status] || '#757575';
  };

  const getStatusLabel = (status, isPresent) => {
    const labels = {
      PRESENT: 'Present',
      HALF_DAY: 'Half Day',
      ABSENT: 'Absent',
      SICK_LEAVE: 'Sick Leave',
      CASUAL_LEAVE: 'Casual Leave',
    };
    return labels[status] || (isPresent ? 'Present' : 'Absent');
  };

  const handleEdit = (attendance) => {
    navigation.navigate('EditAttendance', { attendance });
  };

  const renderAttendance = ({ item, index }) => (
    <AnimatedCard style={styles.card} index={index}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title>{item.employeeName}</Title>
          <Chip
            mode="flat"
            style={[styles.chip, { backgroundColor: getStatusColor(item.attendanceStatus) }]}
            textStyle={{ color: 'white' }}
          >
            {getStatusLabel(item.attendanceStatus, item.isPresent)}
          </Chip>
        </View>
        <Paragraph>Date: {formatDate(item.attendanceDate)}</Paragraph>
        {item.checkInTime && <Paragraph>Check In: {item.checkInTime}</Paragraph>}
        {item.checkOutTime && (
          <Paragraph>Check Out: {item.checkOutTime}</Paragraph>
        )}
        {item.hoursWorked && (
          <Paragraph>Hours Worked: {item.hoursWorked}</Paragraph>
        )}
        {item.notes && <Paragraph>Notes: {item.notes}</Paragraph>}
        <View style={styles.cardActions}>
          <IconButton
            icon="pencil"
            size={20}
            iconColor="#2196F3"
            onPress={() => handleEdit(item)}
          />
        </View>
      </Card.Content>
    </AnimatedCard>
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
        data={filteredAttendance}
        renderItem={renderAttendance}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadAttendance}
      />
      <AnimatedFAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('MarkAttendance')}
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
    minWidth: 80,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    marginRight: -12,
  },
  present: {
    backgroundColor: '#4CAF50',
  },
  absent: {
    backgroundColor: '#F44336',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
